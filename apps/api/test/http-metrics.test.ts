import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';

import { Registry } from 'prom-client';

import { httpMetrics } from '../src/libs/observability/http-metrics';

void test('HTTP metrics use late route templates, count once and separate disconnects', async () => {
  const registry = new Registry();
  const middleware = httpMetrics(registry);
  const req = {
    method: 'GET',
    url: '/topics/private-id?token=private-secret',
    route: undefined as { path: string | string[] } | undefined,
  };
  const response = Object.assign(new EventEmitter(), { statusCode: 200 });
  let next = 0;
  middleware(req, response, () => next++);
  req.route = { path: '/topics/:id' };
  response.emit('finish');
  response.emit('close');
  const closed = Object.assign(new EventEmitter(), { statusCode: 503 });
  middleware({ method: 'SECRET-METHOD' }, closed, () => next++);
  closed.emit('close');
  closed.emit('finish');
  const arrayRoute = Object.assign(new EventEmitter(), { statusCode: 404 });
  middleware(
    { method: 'POST', route: { path: ['/a', '/b'] } },
    arrayRoute,
    () => next++,
  );
  arrayRoute.emit('finish');
  assert.equal(next, 3);
  const metric = (await registry.getMetricsAsJSON())[0];
  const counts = metric.values.filter((value) =>
    value.metricName?.endsWith('_count'),
  );
  assert.equal(counts.length, 3);
  for (const count of counts) assert.equal(count.value, 1);
  assert.deepEqual(
    counts.map((value) => value.labels),
    [
      {
        method: 'GET',
        route: '/topics/:id',
        status: '200',
        outcome: 'finished',
      },
      {
        method: 'OTHER',
        route: 'unmatched-or-static',
        status: '503',
        outcome: 'closed',
      },
      { method: 'POST', route: '/a | /b', status: '404', outcome: 'finished' },
    ],
  );
  assert.doesNotMatch(
    await registry.metrics(),
    /private-id|private-secret|SECRET-METHOD/,
  );
});
