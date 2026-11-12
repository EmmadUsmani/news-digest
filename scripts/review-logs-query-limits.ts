// Explicit installed-binary refusal check using disposable storage only.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--isolated']);
  const unit = await readFile('ops/observability/obs-logs.service', 'utf8');
  const limits = unit.match(/-search\.\S+/g) ?? [];
  assert.deepEqual(limits, [
    '-search.maxConcurrentRequests=2',
    '-search.maxQueryDuration=5s',
    '-search.maxQueueDuration=1s',
    '-search.maxQueryTimeRange=24h',
    '-search.maxQueryLen=4096',
  ]);
  const socket = createServer();
  await new Promise<void>((resolve) => socket.listen(0, '127.0.0.1', resolve));
  const address = socket.address();
  assert.ok(address && typeof address !== 'string');
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  const directory = await mkdtemp(join(tmpdir(), 'logs-query-limits-'));
  const child = spawn(
    '/opt/news-digest-observability/victoria-logs-prod',
    [
      `-httpListenAddr=127.0.0.1:${address.port}`,
      '-http.pathPrefix=/logs',
      `-storageDataPath=${directory}`,
      '-memory.allowedBytes=32MiB',
      ...limits,
    ],
    { stdio: 'ignore', env: { PATH: process.env.PATH, GOMAXPROCS: '1' } },
  );
  const stopped = once(child, 'exit');
  const base = `http://127.0.0.1:${address.port}/logs`;
  const request = (path: string, init?: RequestInit) =>
    fetch(base + path, {
      ...init,
      signal: AbortSignal.timeout(7000),
    });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      assert.equal(child.exitCode, null, 'isolated log store exited');
      try {
        ready = (await request('/health')).ok;
      } catch {
        /* startup */
      }
      if (ready) break;
      await delay(100);
    }
    assert.ok(ready, 'isolated log store startup');
    const end = new Date();
    async function query(hours: number, expression = '*') {
      return request('/select/logsql/query', {
        method: 'POST',
        body: new URLSearchParams({
          query: expression,
          limit: '1',
          start: new Date(end.getTime() - hours * 3600000).toISOString(),
          end: end.toISOString(),
          timeout: '60s',
        }),
      });
    }
    assert.equal((await query(1)).status, 200);
    const broad = await query(25);
    assert.equal(broad.status, 400);
    assert.match(await broad.text(), /search.maxQueryTimeRange/);
    const long = await query(1, 'x'.repeat(4097));
    assert.equal(long.status, 400);
    assert.match(await long.text(), /search.maxQueryLen/);
    // Refusal does not poison the next bounded read or service health.
    assert.equal((await query(1)).status, 200);
    assert.equal((await request('/health')).status, 200);
    console.log(
      'Isolated VictoriaLogs: bounded reads pass; 25-hour ranges and oversized queries refuse; production limits loaded from unit. No live data used.',
    );
  } finally {
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    try {
      await stopped;
    } finally {
      clearTimeout(timer);
      await rm(directory, { recursive: true, force: true });
    }
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Isolated log query check failed',
  );
  process.exitCode = 1;
});
