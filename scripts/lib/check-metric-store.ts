import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { statfsSync, statSync } from 'node:fs';
import { uptime } from 'node:os';

const store = 'http://127.0.0.1:8428/metrics';
type Sample = { metric: Record<string, string>; value: [number, string] };
async function query(expression: string): Promise<Sample[]> {
  const response = await fetch(
    `${store}/api/v1/query?${new URLSearchParams({ query: expression, nocache: '1' })}`,
    { signal: AbortSignal.timeout(15_000) },
  );
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    status: string;
    data: { result: Sample[] };
  };
  assert.equal(body.status, 'success');
  return body.data.result;
}

export async function checkMetricStore() {
  const flags = await (await fetch(`${store}/flags`)).text();
  for (const flag of [
    '-httpListenAddr="127.0.0.1:8428"',
    '-retentionPeriod="30d"',
    '-storage.minFreeDiskSpaceBytes="50MB"',
  ])
    assert.ok(flags.includes(flag), `Missing metrics flag: ${flag}`);
  assert.equal(
    statSync('/var/lib/news-digest-observability/metrics.ext4').size,
    700_000_000,
  );
  const fs = statfsSync('/var/lib/news-digest-metrics');
  assert.ok(fs.blocks * fs.bsize <= 700_000_000);
  const targets = await query('up');
  assert.equal(targets.length, 8);
  assert.equal((await query('redis_up'))[0]?.value[1], '1');
  assert.equal((await query('pg_up'))[0]?.value[1], '1');
  assert.equal(
    (await query('pg_exporter_last_scrape_error'))[0]?.value[1],
    '0',
  );
  const postgresMetrics = await (
    await fetch('http://127.0.0.1:9187/metrics')
  ).text();
  assert.ok(
    !/query=|queryid=|usename=/.test(postgresMetrics),
    'No query/user labels',
  );
  const collectors = [
    ...postgresMetrics.matchAll(
      /pg_scrape_collector_success\{collector="([^"]+)"\} 1/g,
    ),
  ];
  assert.deepEqual(
    collectors.map((match) => match[1]),
    ['stat_database'],
  );
  for (const metric of [
    'numbackends',
    'xact_commit',
    'xact_rollback',
    'blks_hit',
    'blks_read',
    'deadlocks',
  ]) {
    const samples = await query(
      `pg_stat_database_${metric}{datname="news_digest"}`,
    );
    assert.equal(samples.length, 1, `Missing Postgres ${metric}`);
    assert.ok(Number.isFinite(Number(samples[0].value[1])));
  }
  const postgresUnit = execFileSync(
    'systemctl',
    ['show', 'obs-postgres', '-p', 'ExecStart'],
    { encoding: 'utf8' },
  );
  assert.ok(postgresUnit.includes('--web.listen-address=127.0.0.1:9187'));
  assert.ok(postgresUnit.includes('--disable-default-metrics'));
  assert.ok(postgresUnit.includes('--no-collector.stat_statements'));
  const reader = execFileSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'postgres_metrics',
      '-d',
      'news_digest',
      '-At',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      "SELECT current_setting('default_transaction_read_only'), current_setting('statement_timeout'), has_table_privilege(current_user, 'content_items', 'SELECT'), pg_has_role(current_user, 'pg_read_all_stats', 'MEMBER');",
    ],
    { encoding: 'utf8' },
  ).trim();
  assert.equal(reader, 'on|3s|f|f');
  const redisUnit = execFileSync(
    'systemctl',
    ['show', 'obs-redis', '-p', 'ExecStart'],
    { encoding: 'utf8' },
  );
  assert.ok(redisUnit.includes('--web.listen-address=127.0.0.1:9121'));
  assert.ok(redisUnit.includes('--redis-only-metrics'));
  assert.ok(!redisUnit.includes('--check-keys'));
  assert.ok(
    Number(
      (await query('redis_exporter_last_scrape_duration_seconds'))[0]?.value[1],
    ) < 10,
    'Redis collection must fit scrape timeout',
  );
  for (const target of targets)
    assert.equal(target.value[1], '1', `Target down: ${target.metric.job}`);
  for (const service of ['api', 'worker', 'docs', 'schema']) {
    for (const metric of [
      'process_resident_memory_bytes',
      'nodejs_heap_size_used_bytes',
      'nodejs_eventloop_lag_seconds',
      'nodejs_active_handles_total',
    ]) {
      const samples = await query(
        `news_digest_${metric}{service="${service}"}`,
      );
      assert.equal(samples.length, 1, `Missing ${service} ${metric}`);
      assert.ok(Number.isFinite(Number(samples[0].value[1])));
    }
  }
  assert.ok(
    (
      await query(
        'news_digest_http_request_duration_seconds_count{service="api",route="/healthz",method="GET",status="200",outcome="finished"}',
      )
    ).some((sample) => Number(sample.value[1]) > 0),
    'Missing successful API health request metrics',
  );
  assert.ok(
    (
      await query(
        'news_digest_job_duration_seconds_count{service="worker",queue="operations",name="heartbeat",outcome="completed"}',
      )
    ).some((sample) => Number(sample.value[1]) > 0),
    'Missing successful scheduled heartbeat job metrics',
  );
  for (const queue of [
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ]) {
    for (const metric of ['jobs', 'schedulers', 'paused']) {
      const samples = await query(
        `news_digest_queue_${metric}{service="api",queue="${queue}"}`,
      );
      assert.equal(
        samples.length,
        metric === 'jobs' ? 6 : 1,
        `Missing queue ${queue} ${metric}`,
      );
      assert.ok(
        samples.every(
          (sample) =>
            Number.isFinite(Number(sample.value[1])) &&
            Number(sample.value[1]) >= 0,
        ),
      );
    }
  }
  for (const metric of [
    'node_cpu_seconds_total',
    'node_memory_MemAvailable_bytes',
    'node_filesystem_avail_bytes',
    'node_disk_read_bytes_total',
    'node_network_receive_bytes_total',
    'node_load1',
    'node_pressure_memory_waiting_seconds_total',
  ]) {
    assert.ok((await query(metric)).length, `No host samples: ${metric}`);
  }
  assert.equal((await query('node_scrape_collector_success == 0')).length, 0);
  assert.equal(
    (await query('node_textfile_scrape_error')).at(0)?.value[1],
    '0',
  );
  const snapshots = await query('news_digest_unit_snapshot_timestamp_seconds');
  assert.ok(
    snapshots.length && Date.now() / 1000 - Number(snapshots[0].value[1]) < 100,
    'Unit snapshot is stale',
  );
  for (const unit of [
    'news-digest-api',
    'news-digest-worker',
    'news-digest-docs',
    'news-digest-schema',
    'news-digest-agent',
    'obs-logs',
    'obs-shipper',
    'obs-metrics',
    'obs-node',
    'obs-redis',
    'obs-postgres',
  ]) {
    const labels = `{unit="${unit}.service"}`;
    assert.equal(
      (await query(`news_digest_unit_active${labels}`))[0]?.value[1],
      '1',
      `${unit} not active`,
    );
    for (const metric of [
      'memory_bytes',
      'cpu_seconds_total',
      'tasks',
      'restarts_total',
    ]) {
      assert.equal(
        (await query(`news_digest_unit_${metric}${labels}`)).length,
        1,
        `Missing ${unit} ${metric}`,
      );
    }
  }
  const resources = [
    'obs-logs',
    'obs-shipper',
    'obs-metrics',
    'obs-node',
    'obs-redis',
    'obs-postgres',
  ].map((unit) => {
    const fields = Object.fromEntries(
      execFileSync(
        'systemctl',
        [
          'show',
          unit,
          '-p',
          'ActiveState,MemoryCurrent,MemoryHigh,MemoryMax,CPUUsageNSec,ActiveEnterTimestampMonotonic,Nice,CPUWeight,IOWeight,CPUQuotaPerSecUSec',
        ],
        { encoding: 'utf8' },
      )
        .trim()
        .split('\n')
        .map((line) => line.split('=')),
    );
    assert.equal(fields.ActiveState, 'active');
    assert.equal(fields.Nice, '10');
    assert.equal(fields.CPUWeight, '10');
    assert.equal(fields.IOWeight, '10');
    if (unit === 'obs-metrics') {
      assert.equal(Number(fields.MemoryHigh), 88 * 1048576);
      assert.equal(Number(fields.MemoryMax), 112 * 1048576);
    }
    assert.ok(Number(fields.MemoryCurrent) < Number(fields.MemoryMax));
    assert.notEqual(fields.CPUQuotaPerSecUSec, 'infinity');
    const age = uptime() - Number(fields.ActiveEnterTimestampMonotonic) / 1e6;
    return {
      unit,
      memoryMiB: Math.round(Number(fields.MemoryCurrent) / 1048576),
      averageCpuPercentSinceStart:
        Math.round((Number(fields.CPUUsageNSec) / 1e9 / age) * 1000) / 10,
    };
  });
  const page = await fetch('http://127.0.0.1:8000/metrics/vmui/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /VictoriaMetrics/);
  return {
    targets: targets.length,
    units: 11,
    retentionDays: 30,
    diskAllocatedMiB: Math.round(
      (statSync('/var/lib/news-digest-observability/metrics.ext4').blocks *
        512) /
        1048576,
    ),
    resources,
  };
}
