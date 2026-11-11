// Explicit, narrow live export review. Never print labels, samples or bodies.
import assert from 'node:assert/strict';

import {
  boundedTelemetryExport,
  readBoundedTelemetryExport,
} from '../apps/api/src/telemetry-export';
import { isAdminTelemetryRead } from '../apps/api/src/telemetry-query-policy';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live']);
  const path = '/metrics/prometheus/api/v1/export';
  const end = Math.floor(Date.now() / 1000);
  const params = new URLSearchParams({
    'match[]': 'up',
    start: String(end - 60),
    end: String(end),
  });
  const target = boundedTelemetryExport(`${path}?${params}`);
  assert.ok(target);
  // A successful upstream review must not accidentally grant public admission.
  for (const method of ['GET', 'POST', 'HEAD'])
    assert.equal(isAdminTelemetryRead(method, target), false);
  const body = await readBoundedTelemetryExport(
    new URL(target, 'http://127.0.0.1:8428'),
    new AbortController().signal,
  );
  const bytes = body.byteLength;
  const lines = body.toString('utf8').trim().split('\n');
  assert.ok(lines.length > 0);
  let samples = 0;
  for (const line of lines) {
    const row = JSON.parse(line) as {
      metric: Record<string, unknown>;
      values: unknown[];
      timestamps: unknown[];
    };
    assert.deepEqual(Object.keys(row).sort(), [
      'metric',
      'timestamps',
      'values',
    ]);
    assert.equal(row.metric.__name__, 'up');
    assert.ok(
      Object.values(row.metric).every((value) => typeof value === 'string'),
    );
    assert.equal(row.values.length, 1);
    assert.equal(row.timestamps.length, 1);
    assert.ok(row.values.every((value) => typeof value === 'number'));
    assert.ok(
      row.timestamps.every(
        (value) =>
          typeof value === 'number' &&
          value >= (end - 60) * 1000 &&
          value <= end * 1000,
      ),
    );
    samples += row.values.length;
  }
  console.log(
    JSON.stringify({
      path,
      status: 200,
      bytes,
      rows: lines.length,
      samples,
      windowSeconds: 60,
      maxRowsPerLine: 1,
      admission: 'denied',
    }),
  );
}

main().catch(() => {
  console.error(
    'Native telemetry export review failed; response bodies withheld.',
  );
  process.exitCode = 1;
});
