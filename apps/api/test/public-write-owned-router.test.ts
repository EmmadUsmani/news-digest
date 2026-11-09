import assert from 'node:assert/strict';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareOwnedPublicWriteRouter } from '../src/public-write/owned-router';

void test('owned write runtime acquires one pool and shares concurrent shutdown', async () => {
  let acquired = 0;
  let closed = 0;
  const runtime = await prepareOwnedPublicWriteRouter({
    enabled: true,
    origin: 'https://reader.example',
    pool: () => {
      acquired++;
      return {
        end: async () => {
          closed++;
        },
      } as unknown as Pool;
    },
    authenticate: async () => null,
    authorize: () => (_request, _response, next) => next(),
  });
  assert.equal(acquired, 1);
  const first = runtime.close();
  assert.equal(runtime.close(), first);
  await first;
  assert.equal(closed, 1);
});

void test('disabled owned write runtime constructs no resources', async () => {
  const unexpected = () => {
    throw new Error('unexpected construction');
  };
  const runtime = await prepareOwnedPublicWriteRouter({
    enabled: false,
    origin: 'unused',
    pool: unexpected,
    authenticate: unexpected,
    authorize: unexpected,
  });
  let forwarded = false;
  runtime.middleware(null!, null!, () => {
    forwarded = true;
  });
  await runtime.close();
  assert.equal(forwarded, true);
});

void test('owned write startup closes storage on invalid origin or authorization failure', async () => {
  for (const origin of ['invalid', 'https://reader.example']) {
    let closed = 0;
    const failure = new Error('authorization unavailable');
    await assert.rejects(
      prepareOwnedPublicWriteRouter({
        enabled: true,
        origin,
        pool: () =>
          ({
            end: async () => {
              closed++;
            },
          }) as unknown as Pool,
        authenticate: async () => null,
        authorize: () => {
          throw failure;
        },
      }),
      origin === 'invalid' ? TypeError : (error: unknown) => error === failure,
    );
    assert.equal(closed, 1);
  }
});

void test('owned write startup preserves both construction and cleanup errors', async () => {
  const failure = new Error('authorization unavailable');
  const cleanup = new Error('pool shutdown failed');
  await assert.rejects(
    prepareOwnedPublicWriteRouter({
      enabled: true,
      origin: 'https://reader.example',
      pool: () =>
        ({
          end: async () => {
            throw cleanup;
          },
        }) as unknown as Pool,
      authenticate: async () => null,
      authorize: () => {
        throw failure;
      },
    }),
    (error: unknown) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [failure, cleanup]);
      return true;
    },
  );
});
