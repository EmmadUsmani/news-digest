import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

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

void test('public alert counts discard private upstream fields and failures', async (t) => {
  const privateValue = 'fixture-private-email-token-provider-error';
  const mock = t.mock.method(globalThis, 'fetch', async () =>
    Response.json({
      status: 'success',
      private: privateValue,
      data: {
        private: privateValue,
        alerts: [
          {
            state: 'firing',
            labels: { email: privateValue },
            annotations: { summary: privateValue },
            value: privateValue,
          },
        ],
      },
    }),
  );
  const result = await new MonitoringAlerts().read();
  assert.deepEqual(result, {
    checkedAt: result.checkedAt,
    firing: 1,
    pending: 0,
  });
  assert.ok(!JSON.stringify(result).includes(privateValue));
  mock.mock.restore();
  for (const fail of [
    async () => new Response(privateValue, { status: 503 }),
    async () =>
      Response.json({
        status: 'success',
        data: { alerts: [{ state: privateValue }] },
      }),
    async () => {
      throw new Error(privateValue);
    },
  ]) {
    const failure = t.mock.method(globalThis, 'fetch', fail);
    await assert.rejects(new MonitoringAlerts().read(), (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.equal(error.getStatus(), 503);
      assert.deepEqual(error.getResponse(), {
        message: 'Monitoring alerts unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
      assert.ok(!JSON.stringify(error).includes(privateValue));
      return true;
    });
    failure.mock.restore();
  }
});
