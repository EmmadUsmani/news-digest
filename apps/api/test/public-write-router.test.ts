import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { publicWriteRouter } from '../src/public-write/router';
import { publicSourceHttp } from '../src/public-write/source-http';

void test('prepared write router isolates atomic source writes from standalone admission and legacy controllers', async () => {
  let atomic = 0;
  let admissions = 0;
  let legacy = 0;
  const middleware = publicWriteRouter({
    enabled: true,
    source: () =>
      publicSourceHttp({
        enabled: true,
        origin: 'https://reader.example',
        authenticate: async () => ({
          freshAdmin: true,
          auditActor: { localScript: true },
        }),
        writer: {
          async setEnabled(_entry, id, enabled) {
            atomic++;
            return { outcome: 'changed', id, enabled };
          },
        },
      }),
    authorize: () => (_request, _response, next) => {
      admissions++;
      next();
    },
  });
  const server = createServer((request, response) =>
    middleware(request, response, () => {
      legacy++;
      response.writeHead(204).end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const path = '/api/admin/topics/sources/example/enabled';
    const send = (target: string, method = 'PUT') =>
      fetch(base + target, {
        method,
        headers: {
          origin: 'https://reader.example',
          'content-type': 'application/json',
        },
        body: '{"enabled":false}',
      });
    assert.equal((await send(path)).status, 200);
    assert.deepEqual([atomic, admissions, legacy], [1, 0, 0]);
    for (const [target, method] of [
      [path, 'POST'],
      [path + '?extra=1', 'PUT'],
      [path + '/extra', 'PUT'],
    ]) {
      assert.equal((await send(target, method)).status, 404);
    }
    assert.deepEqual([atomic, admissions, legacy], [1, 0, 0]);
    assert.equal((await send('/api/admin/topics/example')).status, 204);
    assert.deepEqual([atomic, admissions, legacy], [1, 1, 1]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('disabled prepared write router constructs no resources and preserves legacy routing', () => {
  const middleware = publicWriteRouter({
    enabled: false,
    source: () => {
      throw new Error('must remain lazy');
    },
    authorize: () => {
      throw new Error('must remain lazy');
    },
  });
  let next = 0;
  middleware(null!, null!, () => {
    next++;
  });
  assert.equal(next, 1);
});
