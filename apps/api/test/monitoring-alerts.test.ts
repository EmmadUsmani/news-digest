import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MonitoringAlerts } from '../src/modules/operations/adapters/monitoring-alerts';

void test('monitoring counts firing and pending states without exposing labels', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      status: 'success',
      data: {
        alerts: [
          { state: 'firing', labels: { secret: 'private' } },
          { state: 'pending' },
          { state: 'inactive' },
          { state: 'firing' },
        ],
      },
    }),
  );
  const result = await new MonitoringAlerts().read();
  assert.equal(result.firing, 2);
  assert.equal(result.pending, 1);
  assert.ok(Number.isFinite(Date.parse(result.checkedAt)));
  assert.deepEqual(Object.keys(result).sort(), [
    'checkedAt',
    'firing',
    'pending',
  ]);
});

void test('monitoring failure and malformed responses never become zero alerts', async (t) => {
  for (const response of [
    new Response('', { status: 503 }),
    Response.json({ status: 'success', data: {} }),
    Response.json({
      status: 'success',
      data: { alerts: [{ state: 'unknown' }] },
    }),
  ]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => response);
    await assert.rejects(
      new MonitoringAlerts().read(),
      /Monitoring alerts unavailable/,
    );
    mock.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('offline');
  });
  await assert.rejects(
    new MonitoringAlerts().read(),
    /Monitoring alerts unavailable/,
  );
});
