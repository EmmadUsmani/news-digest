// Explicit disposable installed-binary rehearsal. Synthetic data only; no live
// store, credentials, service configuration or external requests are used.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { boundedTelemetryExport } from '../apps/api/src/telemetry-export';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--isolated']);
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const address = socket.address();
  assert.ok(address && typeof address !== 'string');
  const port = address.port;
  await new Promise<void>((resolve) => socket.close(() => resolve()));
  const directory = await mkdtemp(join(tmpdir(), 'telemetry-export-limits-'));
  const child = spawn(
    '/opt/news-digest-observability/victoria-metrics-prod',
    [
      `-httpListenAddr=127.0.0.1:${port}`,
      '-http.pathPrefix=/metrics',
      `-storageDataPath=${directory}`,
      '-storage.minFreeDiskSpaceBytes=1MB',
      '-memory.allowedBytes=16MiB',
      '-search.maxConcurrentRequests=2',
      '-search.maxMemoryPerQuery=8MiB',
      '-search.maxExportSeries=32',
      '-search.maxExportDuration=2s',
      '-inmemoryDataFlushInterval=1s',
    ],
    { stdio: 'ignore', env: { PATH: process.env.PATH, GOMAXPROCS: '1' } },
  );
  const stopped = once(child, 'exit');
  const base = `http://127.0.0.1:${port}`;
  const request = (path: string, init?: RequestInit) =>
    fetch(base + path, { ...init, signal: AbortSignal.timeout(5000) });
  async function eventually(check: () => Promise<boolean>) {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      assert.equal(child.exitCode, null, 'isolated metrics process exited');
      try {
        if (await check()) return;
      } catch {
        /* startup or ingestion not ready */
      }
      await delay(100);
    }
    assert.fail('isolated metrics check did not converge');
  }
  try {
    await eventually(async () => (await request('/metrics/health')).ok);
    const end = Math.floor(Date.now() / 1000);
    const target = boundedTelemetryExport(
      `/metrics/prometheus/api/v1/export?match%5B%5D=up&start=${end - 60}&end=${end}`,
    );
    assert.ok(target);
    async function insert(first: number, count: number) {
      const body =
        Array.from(
          { length: count },
          (_, offset) =>
            `up{instance="synthetic-${first + offset}"} 1 ${(end - 1) * 1000}`,
        ).join('\n') + '\n';
      assert.equal(
        (
          await request('/metrics/api/v1/import/prometheus', {
            method: 'POST',
            body,
          })
        ).status,
        204,
      );
    }
    await insert(0, 32);
    await eventually(async () => {
      const response = await request(target);
      return (
        response.ok && (await response.text()).trim().split('\n').length === 32
      );
    });
    await insert(32, 1);
    await eventually(async () => {
      const response = await request(target);
      const body = await response.text();
      return (
        !response.ok &&
        body.includes('the number of matching timeseries exceeds 32')
      );
    });
    console.log(
      'Isolated installed-binary export: 32 synthetic series accepted; 33 refused with reduced-memory export; two-second upstream deadline configured. Live settings unchanged.',
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

main().catch(() => {
  console.error(
    'Isolated telemetry export limits review failed; bodies withheld.',
  );
  process.exitCode = 1;
});
