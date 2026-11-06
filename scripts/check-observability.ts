// Read-only runtime checks. Never enqueue work or call a content provider.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { uptime } from 'node:os';

import { checkGrafana } from './lib/check-grafana';
import { checkJobsBrowser } from './lib/check-jobs-browser';
import { checkLogStore } from './lib/check-log-store';
import { checkMetricStore } from './lib/check-metric-store';
import { runObs, runObsCli } from './lib/obs-query';
import { testEnvironment } from './test-suites';

async function main() {
  if (process.argv.includes('--verify-o10')) {
    const response = await fetch(
      'http://127.0.0.1:9428/logs/select/logsql/query',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          query: '_time:1h event:browser.error',
          limit: '10',
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    assert.equal(response.status, 200);
    const rows = (await response.text())
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    assert.ok(
      rows.some((row) => row.kind === 'error'),
      'Run the explicit browser probe first; error must reach retained logs',
    );
    assert.ok(
      rows.some((row) => row.kind === 'unhandledrejection'),
      'Rejection must reach retained logs',
    );
    for (const row of rows) {
      assert.ok(!JSON.stringify(row).includes('PRIVATE_BROWSER_PROBE'));
      for (const key of ['message', 'stack', 'url', 'reason'])
        assert.equal(row[key], undefined);
    }
    console.log(
      'O10: bounded browser error and rejection records found in local log store.',
    );
  }
  if (process.argv.includes('--verify-o8')) {
    execFileSync('python3', ['ops/observability/test-harness-metrics.py'], {
      stdio: 'pipe',
      timeout: 10_000,
    });
    const response = await fetch('http://127.0.0.1:9100/metrics', {
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(response.status, 200);
    const metrics = await response.text();
    // Optional status disappears while an iteration runs or no retry is reported.
    // Never require a completed iteration or schedule a retry just to verify metrics.
    for (const name of [
      'completed_iteration_duration_seconds',
      'next_retry_timestamp_seconds',
    ]) {
      const prefix = `news_digest_harness_${name} `;
      const rows = metrics.split('\n').filter((row) => row.startsWith(prefix));
      assert.ok(rows.length <= 1, `Duplicate ${name}`);
      for (const row of rows) {
        const value = Number(row.slice(prefix.length));
        assert.ok(Number.isFinite(value) && value >= 0, `Invalid ${name}`);
      }
    }
    for (const source of ['heartbeat', 'usage']) {
      assert.match(
        metrics,
        new RegExp(
          `^news_digest_harness_status_read_success\\{source="${source}"\\} 1$`,
          'm',
        ),
      );
    }
    for (const name of [
      'iteration',
      'previous_exit_code',
      'no_progress_streak',
      'heartbeat_timestamp_seconds',
      'iteration_started_timestamp_seconds',
      'usage_timestamp_seconds',
    ]) {
      assert.match(
        metrics,
        new RegExp(`^news_digest_harness_${name} [0-9.e+]+$`, 'm'),
      );
    }
    const stored = await fetch(
      'http://127.0.0.1:8428/metrics/api/v1/query?query=news_digest_harness_iteration',
      { signal: AbortSignal.timeout(10_000) },
    );
    assert.equal(stored.status, 200);
    const sample = (await stored.json()) as { data: { result: unknown[] } };
    assert.ok(
      sample.data.result.length > 0,
      'Harness samples must reach the metric store',
    );
    // A running iteration can have an old heartbeat; successful reads do not imply freshness.
  }
  if (process.argv.includes('--verify-alerts')) {
    assert.match(
      execFileSync('systemctl', ['cat', 'obs-alerts.service'], {
        encoding: 'utf8',
      }),
      /-remoteWrite.url=http:\/\/127\.0\.0\.1:8428\/metrics(?: |$)/m,
      'Recording rules require persistence in the local metric store',
    );
    execFileSync(
      '/opt/news-digest-observability/vmalert-tool-prod',
      ['unittest', '-files=alerts.test.yml'],
      { cwd: 'ops/observability', stdio: 'pipe', timeout: 30_000 },
    );
    const queueResponse = await fetch('http://127.0.0.1:9464/metrics');
    assert.equal(queueResponse.ok, true);
    const queueMetrics = await queueResponse.text();
    for (const metric of ['schedulers', 'paused']) {
      assert.match(
        queueMetrics,
        new RegExp(
          `^news_digest_queue_${metric}\\{[^\\n]*queue="digest-generation"[^\\n]*\\} \\d`,
          'm',
        ),
      );
    }
    assert.match(
      queueMetrics,
      /^news_digest_queue_next_scheduled_timestamp_seconds\{[^\n]*queue="digest-generation"[^\n]*\} [1-9]\d*(?:\.\d+)?$/m,
    );
    const exporter = await fetch('http://127.0.0.1:9187/metrics');
    assert.equal(exporter.ok, true);
    const exporterMetrics = await exporter.text();
    assert.match(
      exporterMetrics,
      /^news_digest_schedule_unsettled_seconds(?:\{[^\n]*\})? \d/m,
    );
    assert.match(
      exporterMetrics,
      /^news_digest_schedule_latest_due_timestamp_seconds(?:\{[^\n]*\})? \d/m,
    );
    for (const name of ['editing_failed', 'no_pick_chances']) {
      assert.match(
        exporterMetrics,
        new RegExp(
          `^news_digest_bluesky_${name}(?:\\{[^\\n]*\\})? [0-9]+$`,
          'm',
        ),
      );
    }
    const commitments = [
      ...exporterMetrics.matchAll(
        /^news_digest_provider_committed_usd\{([^\n]+)\} ([^\n]+)$/gm,
      ),
    ];
    assert.equal(
      commitments.length,
      4,
      'Expected both providers and UTC periods',
    );
    for (const provider of ['anthropic', 'xai']) {
      for (const period of ['daily', 'monthly']) {
        const row = commitments.find(
          ([, labels]) =>
            labels.includes(`provider="${provider}"`) &&
            labels.includes(`period="${period}"`),
        );
        assert.ok(row, `Missing ${provider}/${period}`);
        assert.ok(Number.isFinite(Number(row[2])) && Number(row[2]) >= 0);
      }
    }
    assert.match(exporterMetrics, /^pg_exporter_last_scrape_error 0$/m);
    const response = await fetch('http://127.0.0.1:8880/api/v1/rules');
    assert.equal(response.ok, true);
    const body = await response.json();
    assert.equal(body.status, 'success');
    const rules = body.data.groups.flatMap(
      (group: {
        rules: { name: string; health: string; lastError?: string }[];
      }) => group.rules,
    );
    for (const name of [
      'DiskSpaceLow',
      'ServiceDown',
      'ScrapeTargetDown',
      'UnitSnapshotStale',
      'HostMemoryPressure',
      'ObservabilityMemoryBudget',
      'RecentJobFailures',
      'BlueskyEditingFailed',
      'BlueskyNoPicks',
      'ApiServerErrorRate',
      'ScheduledEditionUnsettled',
      'ScheduledLifecycleMissing',
      'news_digest_schedule_observed_due_timestamp_seconds',
      'ProviderSpendNearCap',
      'DigestScheduleUnavailable',
      'DigestScheduleStalled',
      'DigestScheduleMetricsMissing',
    ]) {
      const rule = rules.find((row: { name: string }) => row.name === name);
      assert.ok(rule, `Missing ${name}`);
      assert.equal(rule.health, 'ok');
      assert.ok(!rule.lastError);
    }
    const recordedResponse = await fetch(
      'http://127.0.0.1:8428/metrics/api/v1/query?query=news_digest_schedule_observed_due_timestamp_seconds&nocache=1',
    );
    assert.equal(recordedResponse.ok, true);
    const recorded = await recordedResponse.json();
    assert.equal(recorded.status, 'success');
    assert.ok(
      recorded.data.result.length > 0,
      'Due-time recording rule was not persisted',
    );
    const unitMetrics = await fetch('http://127.0.0.1:9100/metrics');
    assert.equal(unitMetrics.ok, true);
    const snapshot = await unitMetrics.text();
    const budgetUnits = [
      ...snapshot.matchAll(
        /^news_digest_unit_memory_limit_bytes\{[^\n]*unit="(obs-[^"]+)"[^\n]*\} ([^\n]+)$/gm,
      ),
    ];
    assert.ok(budgetUnits.length >= 8, 'Missing observability memory ceilings');
    for (const [, unit, value] of budgetUnits) {
      assert.ok(Number.isFinite(Number(value)) && Number(value) > 0, unit);
    }
    const alerts = JSON.parse(await runObs(['alerts']));
    console.log(
      JSON.stringify({
        alertRules: rules.length,
        budgetUnits: budgetUnits.length,
        firing: alerts.firing,
        pending: alerts.pending,
        mutations: 0,
      }),
    );
    return;
  }
  if (process.argv.includes('--verify-timing')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/scheduled-timing-report.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    const report = JSON.parse(
      execFileSync(
        'pnpm',
        [
          'exec',
          'tsx',
          'scripts/report-edition-timing.ts',
          '--scheduled-only',
          '--limit',
          '20',
        ],
        { encoding: 'utf8', timeout: 120_000 },
      ),
    );
    assert.equal(report.evidenceComplete, true);
    assert.equal(report.selection.scheduledOnly, true);
    assert.equal(report.selection.limit, 20);
    assert.ok(report.runs.length > 0 && report.runs.length <= 20);
    assert.ok(
      report.runs.every(
        (run: { scheduledAt: string | null }) => run.scheduledAt,
      ),
    );
    assert.equal(report.runs.length, report.selection.selectedCompletedJobs);
    console.log(
      JSON.stringify({
        timingHistory: 'ok',
        retainedJobs: report.selection.retainedJobs,
        scheduledEditions: report.runs.length,
        mutations: 0,
      }),
    );
    return;
  }
  if (process.argv.includes('--verify-cli')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/obs-cli.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    for (const command of ['health', 'services', 'sources', 'targets']) {
      const result = await runObsCli([command, '--check']);
      assert.equal(result.exitCode, 0);
      assert.equal(JSON.parse(result.output).healthy, true);
    }
    const services = JSON.parse(await runObs(['services']));
    assert.equal(services.healthy, true);
    assert.equal(services.total, 13);
    const sources = JSON.parse(await runObs(['sources']));
    assert.equal(sources.healthy, true);
    assert.ok(sources.total > 0);
    assert.equal(sources.omitted, 0);
    const targets = JSON.parse(await runObs(['targets']));
    assert.equal(targets.healthy, true);
    assert.equal(targets.total, 8);
    assert.equal(targets.omitted, 0);
    const jobs = JSON.parse(await runObs(['jobs']));
    assert.equal(jobs.queues.length, 4);
    assert.ok(
      jobs.queues.every((queue: { available: boolean }) => queue.available),
    );
    assert.ok(
      jobs.queues.every((queue: { runs: unknown[] }) => queue.runs.length <= 5),
    );
    const filteredJobs = JSON.parse(
      await runObs([
        'jobs',
        '--queue',
        'digest-generation',
        '--state',
        'completed',
        '--limit',
        '1',
      ]),
    );
    assert.equal(filteredJobs.queues.length, 1);
    assert.equal(filteredJobs.queues[0].name, 'digest-generation');
    assert.ok(filteredJobs.queues[0].runs.length <= 1);
    assert.ok(
      filteredJobs.queues[0].runs.every(
        (run: { state: string }) => run.state === 'completed',
      ),
    );
    assert.ok(
      filteredJobs.queues[0].retainedRuns >=
        filteredJobs.queues[0].matchingRuns,
    );
    const history = JSON.parse(
      await runObs(['metric', 'up', '--since', '5m', '--step', '30s']),
    );
    assert.equal(history.status, 'success');
    assert.equal(history.data.resultType, 'matrix');
    assert.ok(history.data.result.length > 0);
    assert.ok(
      history.data.result.every(
        (series: { values: unknown[] }) =>
          series.values.length > 0 && series.values.length <= 11,
      ),
    );
    const metrics = JSON.parse(await runObs(['metric', 'up']));
    assert.equal(metrics.status, 'success');
    assert.ok(metrics.data.result.length > 0);
    assert.ok(
      metrics.data.result.every(
        (sample: { value: [number, string] }) => sample.value[1] === '1',
      ),
    );
    const logs = (
      await runObs([
        'logs',
        '--service',
        'worker',
        '--since',
        '1h',
        '--limit',
        '2',
      ])
    )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assert.ok(logs.length > 0 && logs.length <= 2);
    assert.ok(logs.every((line) => line.service === 'worker'));
    const jobSamples = (
      await runObs([
        'logs',
        '--service',
        'worker',
        '--grep',
        'Job finished',
        '--limit',
        '2',
      ])
    )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const job = jobSamples.find((line) => line.jobId && line.queue);
    assert.ok(job, 'No recent completed worker job for correlation check');
    const correlated = (
      await runObs([
        'logs',
        '--queue',
        job.queue,
        '--job',
        job.jobId,
        '--limit',
        '20',
      ])
    )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assert.ok(correlated.length > 0 && correlated.length <= 20);
    assert.ok(
      correlated.every(
        (line) => line.jobId === job.jobId && line.queue === job.queue,
      ),
    );
    const absent = await runObs([
      'logs',
      '--queue',
      job.queue,
      '--job',
      `${job.jobId}-absent`,
      '--limit',
      '1',
    ]);
    assert.equal(absent.trim(), '', 'Job filter must not match an ID prefix');
    await runObs(['errors', '--since', '5m', '--limit', '1']);
    console.log(
      JSON.stringify({
        cli: 'ok',
        queues: jobs.queues.length,
        scrapeTargets: metrics.data.result.length,
        workerLogs: logs.length,
        correlatedJobLogs: correlated.length,
        mutations: 0,
      }),
    );
    return;
  }
  if (process.argv.includes('--verify-job-metrics')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/job-metrics.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    const response = await fetch('http://127.0.0.1:9465/metrics', {
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(response.status, 200);
    const body = await response.text();
    assert.ok(
      body.includes('# TYPE news_digest_job_duration_seconds histogram'),
    );
    const counts = body
      .split('\n')
      .filter((line) =>
        line.startsWith('news_digest_job_duration_seconds_count{'),
      );
    assert.ok(
      counts.length > 0,
      'Wait for a normal worker attempt after restart; never enqueue verification work',
    );
    for (const line of counts) {
      assert.match(line, /trigger="(scheduled|manual|unknown)"/);
      assert.match(line, /outcome="(completed|failed)"/);
    }
    assert.ok(
      counts.some(
        (line) =>
          line.includes('queue="operations"') &&
          line.includes('trigger="scheduled"'),
      ),
      'Normal recurring heartbeat must have scheduled attribution',
    );
  }
  if (process.argv.includes('--verify-job-correlation')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/logging.test.ts',
        'apps/api/test/job-metrics.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    // A heartbeat runs once a minute; shipping can follow its completion.
    // Retry reads only, without scheduling a job or writing a synthetic record.
    let line = '';
    const deadline = Date.now() + 60_000;
    do {
      const response = await fetch(
        'http://127.0.0.1:9428/logs/select/logsql/query',
        {
          method: 'POST',
          body: new URLSearchParams({
            query:
              '_time:5m service:worker event:job.finish queue:operations trigger:scheduled | limit 1',
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      assert.equal(response.status, 200);
      line = (await response.text()).trim().split('\n')[0];
      if (line) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (Date.now() < deadline);
    assert.ok(
      line,
      'Wait for a normal heartbeat and journal shipping; never enqueue verification work',
    );
    const record = JSON.parse(line) as Record<string, string>;
    assert.equal(record.jobName, 'heartbeat');
    assert.ok(Number(record.attempt) >= 1);
    assert.ok(Number(record.durationMs) >= 0);
    assert.ok(record.jobId);
    assert.equal(record.editionId, undefined);
  }
  const grafana = process.argv.includes('--verify-grafana')
    ? await checkGrafana()
    : undefined;
  if (process.argv.includes('--verify-queue-metrics')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/queue-metrics.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    const response = await fetch('http://127.0.0.1:9464/metrics');
    assert.equal(response.status, 200);
    const body = await response.text();
    for (const queue of [
      'operations',
      'ingestion',
      'digest-generation',
      'social-collection',
    ]) {
      for (const metric of ['jobs', 'schedulers', 'paused'])
        assert.ok(
          body.includes(`news_digest_queue_${metric}{queue="${queue}"`),
          `Missing ${queue} ${metric}`,
        );
    }
  }
  if (process.argv.includes('--verify-external-http-metrics')) {
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        'apps/api/test/external-http-logging.test.ts',
        'apps/api/test/provider-metrics.test.ts',
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
    for (const port of [9464, 9465]) {
      const response = await fetch(`http://127.0.0.1:${port}/metrics`);
      assert.equal(response.status, 200);
      assert.ok(
        (await response.text()).includes(
          '# TYPE news_digest_external_call_duration_seconds histogram',
        ),
      );
    }
  }
  const metricStore = process.argv.includes('--verify-o4')
    ? await checkMetricStore()
    : undefined;
  const jobsBrowser = process.argv.includes('--verify-o3')
    ? await checkJobsBrowser()
    : undefined;
  const verifyO1 = process.argv.includes('--verify-o1');
  const logStore = process.argv.includes('--verify-o2')
    ? await checkLogStore()
    : undefined;
  if (verifyO1) {
    // Forced fatal errors run in disposable children; never crash a live service.
    // Provider suites use injected fakes and the same disabled environment as CI.
    const suites = [
      'logging',
      'slow-queries',
      'external-http-logging',
      'llm',
      'x-search-logging',
      'bluesky-search',
      'x-budget-logging',
      'reserve-logging',
      'reserve-lifecycle-logging',
      'edition-logging',
    ];
    execFileSync(
      'pnpm',
      [
        'exec',
        'tsx',
        '--test',
        '--test-reporter=dot',
        ...suites.map((name) => `apps/api/test/${name}.test.ts`),
      ],
      { env: testEnvironment(), stdio: 'pipe', timeout: 120_000 },
    );
  }
  const response = await fetch('http://127.0.0.1:8000/healthz', {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200);
  const requestId = response.headers.get('x-request-id');
  assert.ok(requestId, 'API must return a request ID');
  await response.text();
  // Journald can lag behind the completed response; retry only the journal read.
  let logs: Record<string, unknown>[] = [];
  for (let attempt = 0; attempt < 10; attempt++) {
    const output = execFileSync(
      'journalctl',
      [
        '--user',
        '-u',
        'news-digest-api',
        '-u',
        'news-digest-worker',
        '-n',
        '500',
        '-o',
        'cat',
        '--no-pager',
      ],
      { encoding: 'utf8', maxBuffer: 2_000_000 },
    );
    logs = output.split('\n').flatMap((line) => {
      try {
        return [JSON.parse(line) as Record<string, unknown>];
      } catch {
        return [];
      }
    });
    if (
      logs.some(
        (line) => line.requestId === requestId && line.event === 'http.request',
      )
    )
      break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(
    logs.some(
      (line) =>
        line.service === 'api' &&
        line.requestId === requestId &&
        line.event === 'http.request',
    ),
    'Request must be present in API journal',
  );
  assert.ok(
    logs.some(
      (line) =>
        line.service === 'worker' &&
        line.event === 'job.finish' &&
        line.jobId &&
        line.queue,
    ),
    'Worker must have completed a logged job (allow the heartbeat to run after restart)',
  );
  const runtimeRecords = logs.filter((line) =>
    ['api', 'worker'].includes(String(line.service)),
  );
  for (const line of runtimeRecords) {
    assert.equal(typeof line.level, 'number', 'JSON severity required');
    assert.equal(typeof line.time, 'number', 'JSON timestamp required');
    if (line.event === 'http.request') {
      assert.equal(typeof line.requestId, 'string');
      assert.equal(typeof line.method, 'string');
      // Earlier journal entries can contain Express multi-path route arrays.
      assert.ok(
        typeof line.route === 'string' ||
          (Array.isArray(line.route) &&
            line.route.every((path) => typeof path === 'string')),
      );
      assert.equal(typeof line.status, 'number');
      assert.equal(typeof line.durationMs, 'number');
    }
    if (
      ['job.start', 'job.finish', 'job.failure'].includes(String(line.event))
    ) {
      assert.equal(typeof line.jobId, 'string');
      assert.equal(typeof line.queue, 'string');
      if (line.event === 'job.start')
        assert.equal(typeof line.attempt, 'number');
      else assert.equal(typeof line.durationMs, 'number');
    }
  }
  const resources = ['api', 'worker'].map((role) => {
    const output = execFileSync(
      'systemctl',
      [
        '--user',
        'show',
        `news-digest-${role}`,
        '-p',
        'ActiveState',
        '-p',
        'MemoryCurrent',
        '-p',
        'CPUUsageNSec',
        '-p',
        'ActiveEnterTimestampMonotonic',
      ],
      { encoding: 'utf8' },
    );
    const fields = Object.fromEntries(
      output
        .trim()
        .split('\n')
        .map((line) => line.split('=')),
    );
    assert.equal(fields.ActiveState, 'active');
    const age = uptime() - Number(fields.ActiveEnterTimestampMonotonic) / 1e6;
    return {
      service: role,
      memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      averageCpuPercentSinceStart:
        age > 0
          ? Math.round((Number(fields.CPUUsageNSec) / 1e9 / age) * 1000) / 10
          : null,
    };
  });
  console.log(
    JSON.stringify({
      offlineO1Proof: verifyO1
        ? 'passed (10 suites; includes redaction and forced fatal children)'
        : 'not requested',
      validatedRuntimeRecords: runtimeRecords.length,
      requestLog: 'ok',
      workerJobLog: 'ok',
      externalCallsInJournalSample: logs.filter(
        (line) => line.event === 'external.call',
      ).length,
      externalCallsByTarget: Object.fromEntries(
        ['feed', 'hacker-news', 'anthropic', 'x-oembed', 'xai', 'bluesky'].map(
          (target) => [
            target,
            logs.filter(
              (line) =>
                line.event === 'external.call' && line.target === target,
            ).length,
          ],
        ),
      ),
      budgetEventsInJournalSample: Object.fromEntries(
        [
          'budget.decision',
          'budget.settlement',
          'budget.failure',
          'budget.reserve-decision',
          'budget.reserve-lifecycle',
        ].map((event) => [
          event,
          logs.filter((line) => line.event === event).length,
        ]),
      ),
      xDiscoveryBudgetEventsInJournalSample: logs.filter(
        (line) =>
          line.target === 'xai' &&
          typeof line.event === 'string' &&
          line.event.startsWith('budget.'),
      ).length,
      editionEventsInJournalSample: Object.fromEntries(
        [
          'edition.start',
          'edition.step',
          'edition.finish',
          'edition.failure',
        ].map((event) => [
          event,
          logs.filter((line) => line.event === event).length,
        ]),
      ),
      resources,
      logStore,
      jobsBrowser,
      metricStore,
      grafana,
    }),
  );
}
void main();
