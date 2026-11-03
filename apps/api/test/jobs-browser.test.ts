import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';

import { jobsReadOnly } from '../src/modules/operations/adapters/jobs-browser';

void test('jobs browser rejects mutations before the router receives them', async () => {
  let routed = 0;
  const server = createServer((req, res) =>
    jobsReadOnly(req, res, () => {
      routed++;
      res.end('read');
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
      const response = await fetch(
        `http://127.0.0.1:${address.port}/queues/api/queues/pause`,
        { method },
      );
      assert.equal(response.status, 405);
      assert.equal(response.headers.get('allow'), 'GET, HEAD');
    }
    assert.equal(routed, 0);
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(`http://127.0.0.1:${address.port}/queues/`, {
        method,
      });
      assert.equal(response.status, 200);
    }
    assert.equal(routed, 2);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
