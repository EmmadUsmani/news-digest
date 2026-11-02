import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import { testEnvironment } from '../../../scripts/test-suites';
import { database, redis } from '../src/libs/db/connections';

function mockEnv(t: TestContext, key: string, value: string | undefined) {
  const original = process.env[key];
  t.after(() => {
    if (original === undefined) delete process.env[key];
    else process.env[key] = original;
  });
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

void test('connection factories reject unisolated test processes before creating clients', (t) => {
  mockEnv(t, 'NODE_TEST_CONTEXT', 'child-v8');
  // Even valid-looking inherited production addresses must not bypass admission.
  mockEnv(t, 'DATABASE_URL', 'postgres://postgres@127.0.0.1:5432/news_digest');
  mockEnv(t, 'REDIS_URL', 'redis://127.0.0.1:6379');
  mockEnv(t, 'NEWS_DIGEST_ISOLATED_TEST', undefined);
  for (const flag of [undefined, '', '0', 'true']) {
    if (flag === undefined) delete process.env.NEWS_DIGEST_ISOLATED_TEST;
    else process.env.NEWS_DIGEST_ISOLATED_TEST = flag;
    for (const connect of [database, redis]) {
      assert.throws(connect, {
        message:
          'Run tests with pnpm test to use disposable Postgres and Redis',
      });
    }
  }
});

void test('test runners replace inherited service addresses and paid-provider opt-ins', (t) => {
  const inherited = {
    DATABASE_URL: 'postgres://owner:fixture@live.invalid/news_digest',
    REDIS_URL: 'redis://live.invalid:6379',
    ANTHROPIC_API_KEY: 'synthetic-anthropic-key',
    XAI_API_KEY: 'synthetic-xai-key',
    LLM_LIVE: '1',
    NEWS_DIGEST_ISOLATED_TEST: '1',
  };
  for (const [key, value] of Object.entries(inherited)) mockEnv(t, key, value);
  const env = testEnvironment();
  assert.equal(
    env.DATABASE_URL,
    'postgres://invalid:invalid@127.0.0.1:1/disabled',
  );
  assert.equal(env.REDIS_URL, 'redis://127.0.0.1:1');
  assert.equal(env.ANTHROPIC_API_KEY, '');
  assert.equal(env.XAI_API_KEY, '');
  assert.equal(env.LLM_LIVE, '');
  assert.equal(env.NEWS_DIGEST_ISOLATED_TEST, '0');
  for (const [key, value] of Object.entries(inherited)) {
    assert.equal(
      process.env[key],
      value,
      'sanitizing a child must not mutate its parent',
    );
  }
});
