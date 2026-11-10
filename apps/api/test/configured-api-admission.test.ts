import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { apiAdmissionHttp } from '../src/public-write/api-admission-http';
import { prepareConfiguredApiAdmission } from '../src/public-write/configured-api-admission';

const env = {
  PUBLIC_MODE: '1',
  ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1,::1',
  ACCOUNT_SECRET_KEY: 'ab'.repeat(32),
};

void test('configured API admission validates before connecting and private rollback opens nothing', () => {
  const unexpected = () => assert.fail('Unexpected Redis acquisition');
  assert.equal(prepareConfiguredApiAdmission({}, unexpected), null);
  assert.equal(
    prepareConfiguredApiAdmission(
      { ...env, PUBLIC_MODE: '0', ACCOUNT_SECRET_KEY: '' },
      unexpected,
    ),
    null,
  );
  for (const invalid of [
    { PUBLIC_MODE: 'yes' },
    { ACCOUNT_TRUSTED_PROXY_PEERS: '' },
    { ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1,' },
    { ACCOUNT_TRUSTED_PROXY_PEERS: 'not-an-ip' },
    { ACCOUNT_SECRET_KEY: '' },
    { ACCOUNT_SECRET_KEY: 'x'.repeat(64) },
  ])
    assert.throws(() =>
      prepareConfiguredApiAdmission({ ...env, ...invalid }, unexpected),
    );
});

void test('configured API gate uses verified last visitor, hides client keys and owns Redis shutdown', async () => {
  const keys: unknown[] = [];
  let calls = 0;
  let closed = 0;
  let available = true;
  const prepared = prepareConfiguredApiAdmission(env, () => ({
    eval: async (...args: unknown[]) => {
      calls++;
      keys.push(args[2]);
      assert.deepEqual(args.slice(3), [120, 60_000]);
      if (!available) throw new Error('Unavailable');
      return 1;
    },
    quit: async () => {
      closed++;
      return 'OK';
    },
  }))!;
  const gate = apiAdmissionHttp({ enabled: true, ...prepared });
  const server = createServer((request, response) => {
    void gate(request, response, () => response.writeHead(204).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    for (const prefix of [
      '',
      '198.51.100.99, ',
      '192.0.2.4, 198.51.100.99, ',
    ]) {
      const response = await fetch(base + '/api/editions/latest', {
        headers: { 'X-Forwarded-For': prefix + '203.0.113.7, 203.0.113.7' },
      });
      assert.equal(response.status, 204);
    }
    assert.equal(new Set(keys).size, 1);
    assert.match(String(keys[0]), /^public:api:client:[a-f0-9]{64}$/);
    assert.equal((await fetch(base + '/api/editions/latest')).status, 429);
    assert.equal(calls, 3);
    available = false;
    const denied = await fetch(base + '/api/account/session', {
      headers: { 'X-Forwarded-For': '203.0.113.7' },
    });
    assert.equal(denied.status, 429);
    assert.equal(denied.headers.get('cache-control'), 'no-store');
    assert.equal(await denied.text(), '');
    for (const path of ['/healthz', '/assets/app.js'])
      assert.equal((await fetch(base + path)).status, 204);
    assert.equal(calls, 4);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const closing = prepared.close();
    assert.equal(prepared.close(), closing);
    await closing;
  }
  assert.equal(closed, 1);
});
