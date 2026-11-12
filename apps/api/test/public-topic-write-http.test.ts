import assert from 'node:assert/strict';
import { createServer, request } from 'node:http';
import test from 'node:test';

import type { PublicAccessPrincipal } from '../src/public-access';
import { publicAccountAuthenticator } from '../src/public-account-access';
import { publicTopicHttp } from '../src/public-write/topic-http';

void test('prepared topic write HTTP validates bounded requests and authorizes atomic writes', async () => {
  const actor = { userId: '11111111-1111-4111-8111-111111111111' };
  let principal: PublicAccessPrincipal | null = {
    freshAdmin: true,
    auditActor: actor,
  };
  let enabled = true;
  let failure = false;
  let authFailure = false;
  let outcome: 'changed' | 'unchanged' | 'not-found' = 'changed';
  let calls = 0;
  let authCalls = 0;
  const at = new Date('2026-11-09T11:00:00Z');
  const path = '/api/admin/topics/22222222-2222-4222-8222-222222222222/enabled';
  const server = createServer((req, res) =>
    publicTopicHttp({
      enabled,
      origin: 'https://reader.example',
      now: () => at,
      authenticate: async (_request, now) => {
        authCalls++;
        assert.equal(now, at);
        if (authFailure) throw new Error('private session details');
        return principal;
      },
      writer: {
        async setEnabled(entry, id, value) {
          calls++;
          assert.deepEqual(entry, {
            actor: principal!.auditActor,
            action: 'PUT',
            target: path,
            at,
          });
          assert.equal(id, '22222222-2222-4222-8222-222222222222');
          assert.equal(value, false);
          if (failure) throw new Error('private database credential');
          return outcome === 'not-found'
            ? { outcome }
            : { outcome, id, enabled: value, secret: 'hidden' };
        },
      },
    })(req, res, () => {
      res.statusCode = 404;
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const put = (
    body = '{"enabled":false}',
    headers = {},
    target = path,
    method = 'PUT',
  ) =>
    fetch(base + target, {
      method,
      headers: {
        origin: 'https://reader.example',
        'content-type': 'application/json',
        ...headers,
      },
      body,
    });
  try {
    for (const result of ['changed', 'unchanged'] as const) {
      outcome = result;
      const response = await put();
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('vary'), 'Cookie');
      assert.deepEqual(await response.json(), {
        outcome: result,
        id: '22222222-2222-4222-8222-222222222222',
        enabled: false,
      });
    }
    const before = calls;
    const beforeAuth = authCalls;
    for (const body of [
      'null',
      '[]',
      '{}',
      '{',
      '{"enabled":"false"}',
      '{"enabled":false,"extra":1}',
    ])
      assert.equal((await put(body)).status, 400);
    assert.equal(
      (await put(undefined, { origin: 'https://evil.example' })).status,
      400,
    );
    assert.equal(
      (await put(undefined, { 'content-type': 'text/plain' })).status,
      400,
    );
    assert.equal((await put(' '.repeat(2049))).status, 413);
    // An async iterable omits Content-Length and exercises the streamed limit.
    const streamed = await fetch(base + path, {
      method: 'PUT',
      headers: {
        origin: 'https://reader.example',
        'content-type': 'application/json',
      },
      body: (async function* () {
        yield ' '.repeat(1024);
        yield ' '.repeat(1025);
      })(),
      duplex: 'half',
    } as RequestInit);
    assert.equal(streamed.status, 413);
    for (const target of [
      path + '?secret=hidden',
      path.replace('22222222', '%322222222'),
      path + '/',
      path.replace('22222222', 'INVALID'),
    ])
      assert.equal((await put(undefined, {}, target)).status, 404);
    assert.equal((await put(undefined, {}, path, 'POST')).status, 404);
    // Use node:http to preserve separate, mixed-case wire headers. Fetch
    // combines duplicates and cannot expose Node's discarded second value.
    for (const headers of [
      [
        'Origin',
        'https://reader.example',
        'Content-Type',
        'application/json',
        'cOnTeNt-TyPe',
        'text/plain',
      ],
      [
        'Origin',
        'https://reader.example',
        'Content-Type',
        'application/json',
        'content-type',
        'application/json',
      ],
      [
        'Origin',
        'https://reader.example',
        'oRiGiN',
        'https://reader.example',
        'Content-Type',
        'application/json',
      ],
      [
        'Origin',
        'https://reader.example',
        'origin',
        'https://evil.example',
        'Content-Type',
        'application/json',
      ],
    ]) {
      const status = await new Promise<number | undefined>(
        (resolve, reject) => {
          const req = request(
            base + path,
            { method: 'PUT', headers },
            (res) => {
              res.resume();
              res.on('end', () => resolve(res.statusCode));
            },
          );
          req.on('error', reject);
          req.end('{"enabled":false}');
        },
      );
      assert.equal(status, 400);
    }
    enabled = false;
    assert.equal((await put()).status, 404);
    enabled = true;
    assert.equal(authCalls, beforeAuth);
    assert.equal(calls, before);
    for (const value of [null, { freshAdmin: false, auditActor: actor }]) {
      principal = value;
      assert.equal((await put()).status, 404);
    }
    for (const value of [
      { freshAdmin: true },
      { freshAdmin: true, auditActor: { userId: 'bad' } },
    ]) {
      principal = value;
      assert.equal((await put()).status, 503);
    }
    assert.equal(calls, before);
    principal = {
      freshAdmin: true,
      auditActor: actor,
      cookie: 'renewed=private; Secure; HttpOnly',
    };
    outcome = 'not-found';
    const missing = await put();
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('set-cookie'), principal.cookie);
    failure = true;
    const refused = await put();
    assert.equal(refused.status, 503);
    assert.equal(await refused.text(), '');
    authFailure = true;
    const authRefused = await put();
    assert.equal(authRefused.status, 503);
    assert.equal(await authRefused.text(), '');
    authFailure = false;
    failure = false;
    principal = { freshAdmin: true, auditActor: { localScript: true } };
    outcome = 'changed';
    assert.equal((await put()).status, 200);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

void test('atomic topic writes allow only direct authenticated scripts to omit Origin', async () => {
  let writes = 0;
  let sessions = 0;
  const middleware = publicTopicHttp({
    enabled: true,
    origin: 'https://reader.example',
    localToken: 'local-secret',
    authenticate: publicAccountAuthenticator(
      {
        authorization: async () => {
          sessions++;
          return null;
        },
      },
      'local-secret',
    ),
    writer: {
      async setEnabled(entry, id, enabled) {
        assert.deepEqual(entry.actor, { localScript: true });
        writes++;
        return { outcome: 'changed', id, enabled };
      },
    },
  });
  const server = createServer((req, res) =>
    middleware(req, res, () => {
      assert.fail('topic write escaped atomic handler');
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/api/admin/topics/22222222-2222-4222-8222-222222222222/enabled`;
  try {
    const call = (headers: string[], body = '{"enabled":false}') =>
      new Promise<number | undefined>((resolve, reject) => {
        const req = request(
          url,
          { method: 'PUT', headers: ['Host', '127.0.0.1', ...headers] },
          (res) => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
          },
        );
        req.on('error', reject);
        req.end(body);
      });
    const local = [
      'Content-Type',
      'application/json',
      'ADMIN_LOCAL_TOKEN',
      'local-secret',
    ];
    assert.equal(await call(local), 200);
    for (const headers of [
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/json', 'ADMIN_LOCAL_TOKEN', 'wrong'],
      [...local, 'admin_local_token', 'local-secret'],
      [...local, 'Forwarded', 'for=127.0.0.1'],
      [...local, 'X-Forwarded-For', '127.0.0.1'],
      [...local, 'X-Forwarded-Proto', 'https'],
      [...local, 'Origin', 'https://foreign.example'],
      [...local, 'Content-Type', 'application/json'],
    ])
      assert.equal(await call(headers), 400);
    assert.equal(await call(local, '{"enabled":false,"extra":true}'), 400);
    assert.equal(await call(local, ' '.repeat(2049)), 413);
    assert.equal(writes, 1);
    assert.equal(sessions, 0);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
