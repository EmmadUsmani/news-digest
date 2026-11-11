import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { publicJobsBrowser } from '../src/modules/operations/adapters/public-jobs-browser';

void test('public queue status projects only fixed counts and next runs over HTTP', async () => {
  const names = [
    'operations',
    'ingestion',
    'digest-generation',
    'social-collection',
  ];
  const next = 1_794_384_000_000;
  let unavailable = false;
  let reads = 0;
  const server = createServer(
    publicJobsBrowser(
      [...names, 'private-queue'].map((name) => ({
        name,
        async getJobCounts(...states) {
          assert.ok(names.includes(name));
          assert.deepEqual(states, [
            'waiting',
            'active',
            'delayed',
            'failed',
            'completed',
          ]);
          reads++;
          if (unavailable) throw new Error('private Redis connection details');
          return { failed: 2, 'private-state': 987654 };
        },
        async getJobSchedulers(...range) {
          assert.deepEqual(range, [0, 0, true]);
          return name === 'operations'
            ? [
                {
                  next,
                  key: 'private-scheduler',
                  name: 'private-scheduler-name',
                  template: { data: { secret: 'private-data' } },
                },
              ]
            : [];
        },
      })),
    ),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const origin = `http://127.0.0.1:${address.port}`;
    for (const path of [
      '/',
      '/api/queues?limit=10000',
      '/api/queues/operations',
      '/api/queues/operations/1/logs',
      '/api/redis/stats',
      '/api/job-schedulers',
    ]) {
      assert.equal((await fetch(origin + path)).status, 404);
    }
    const endpoint = origin + '/api/queues';
    const mutation = await fetch(endpoint, { method: 'POST' });
    assert.equal(mutation.status, 405);
    assert.equal(mutation.headers.get('allow'), 'GET, HEAD');
    assert.equal(reads, 0);

    const response = await fetch(endpoint);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), {
      queues: names.map((name) => ({
        name,
        counts: { waiting: 0, active: 0, delayed: 0, failed: 2, completed: 0 },
        nextRunAt: name === 'operations' ? next : null,
      })),
    });

    const head = await fetch(endpoint, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    unavailable = true;
    const error = await fetch(endpoint);
    assert.equal(error.status, 503);
    assert.equal(error.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await error.json(), { error: 'Queue status unavailable' });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
