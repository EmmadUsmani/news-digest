import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareStoredAccessRuntime } from '../src/public-write/stored-access-runtime';

void test('stored access shares account identity, lazily records writes and closes every owner after failure', async () => {
  const closed: string[] = [];
  let recorded = 0;
  let constructed = 0;
  const runtime = await prepareStoredAccessRuntime(
    {
      enabled: true,
      origin: 'https://reader.example',
      env: {},
      legacyAccess: () => assert.fail('Legacy guard constructed'),
    },
    {
      accounts: () => ({
        middleware: (_request, _response, next) => next(),
        handlers: {
          authorization: async () => ({
            freshAdmin: true,
            auditActor: { userId: '00000000-0000-4000-8000-000000000001' },
            cookie: null,
          }),
        },
        close: async () => {
          closed.push('accounts');
          throw new Error('Account cleanup failed');
        },
      }),
      pool: () =>
        ({
          end: async () => {
            closed.push('sources');
          },
        }) as unknown as Pool,
      recorder: () => {
        constructed++;
        return {
          record: async (entry) => {
            assert.deepEqual(entry.actor, {
              userId: '00000000-0000-4000-8000-000000000001',
            });
            recorded++;
          },
          onModuleDestroy: async () => {
            closed.push('recorder');
          },
        };
      },
    },
  );
  const server = createServer((request, response) =>
    runtime.middleware(request, response, () => response.writeHead(204).end()),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    assert.equal((await fetch(base + '/api/editions/latest')).status, 204);
    assert.equal(constructed, 0);
    assert.equal(
      (
        await fetch(base + '/api/admin/topics', {
          method: 'POST',
          headers: {
            origin: 'https://reader.example',
            'content-type': 'application/json',
          },
          body: '{}',
        })
      ).status,
      204,
    );
    assert.equal(recorded, 1);
    const closing = runtime.close();
    assert.equal(runtime.close(), closing);
    await assert.rejects(closing, AggregateError);
    assert.deepEqual(closed.sort(), ['accounts', 'recorder', 'sources']);
    assert.equal((await fetch(base + '/api/editions/latest')).status, 503);
    assert.equal(constructed, 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

void test('stored public startup refuses disabled accounts and cleans their resources', async () => {
  let closed = 0;
  await assert.rejects(
    prepareStoredAccessRuntime(
      {
        enabled: true,
        origin: 'https://reader.example',
        env: {},
        legacyAccess: () => assert.fail(),
      },
      {
        accounts: () => ({
          middleware: null,
          handlers: null,
          close: async () => {
            closed++;
          },
        }),
        pool: () => assert.fail('Source storage acquired'),
        recorder: () => assert.fail('Recorder acquired'),
      },
    ),
    /requires account transport/,
  );
  assert.equal(closed, 1);
});
