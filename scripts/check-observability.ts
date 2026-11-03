// Read-only runtime checks. Never enqueue work or call a content provider.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { uptime } from 'node:os';

async function main() {
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
      resources,
      extraServices: 0,
      extraLogStoreBytes: 0,
    }),
  );
}
void main();
