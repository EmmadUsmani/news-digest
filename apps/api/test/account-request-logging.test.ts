import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import {
  createLogger,
  requestLogging,
} from '../src/libs/observability/logging';
import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { accountHttp } from '../src/modules/accounts/adapters/account-http';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';

void test('sign-in HTTP request logs exclude credentials, identities and client addresses', async () => {
  const email = 'logging-reader@example.test';
  const code = '739182';
  const token = 'L'.repeat(43);
  const client = '198.51.100.83';
  const cookie = `__Host-reader_session=${token}; Secure; HttpOnly; Path=/`;
  const lines: string[] = [];
  // No configured secret values: this proves omission, rather than fixture redaction.
  const log = createLogger(
    'account-request-test',
    {
      write: (line) => {
        lines.push(line);
      },
    },
    [],
  );
  let fail = false;
  let redeemed = false;
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example'),
    {
      request: async () => {
        if (fail) throw new Error(`${email} ${code} ${token} ${client}`);
      },
    },
    {
      redeem: async () => {
        if (redeemed) return null;
        redeemed = true;
        return { sessionId: 'private-session-id', cookie };
      },
    },
    {
      authenticate: async () => null,
      signOut: async () => cookie,
      signOutAllDevices: async () => cookie,
    },
    {
      issue: async () => null,
      redeem: async () => ({ sessionId: 'private-session-id', cookie }),
    },
  );
  const accounts = accountHttp({
    enabled: true,
    handlers,
    client: () => client,
  });
  const server = createServer((req, res) =>
    requestLogging(log)(req, res, () =>
      accounts(req, res, () => {
        res.statusCode = 404;
        res.end();
      }),
    ),
  );
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const requestIds: string[] = [];
  async function send(
    path: string,
    status: number,
    body?: unknown,
    origin = 'https://reader.example',
  ) {
    const response = await fetch(`${base}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        Cookie: cookie,
        Authorization: `Bearer ${token}`,
        'X-Forwarded-For': client,
        'X-ExeDev-Email': email,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    assert.equal(response.status, status);
    requestIds.push(response.headers.get('x-request-id') ?? '');
    await response.arrayBuffer();
  }
  try {
    await send(`/account/sign-in?email=${email}&token=${token}`, 200);
    await send('/api/account/code', 202, { email });
    await send('/api/account/redeem', 204, { email, code });
    await send('/api/account/redeem', 401, { email, code });
    await send('/api/account/link-redeem', 204, { token });
    await send('/api/account/session', 200);
    await send('/api/account/logout', 204, {});
    await send('/api/account/code', 400, { email }, 'https://foreign.example');
    fail = true;
    await send('/api/account/code', 503, { email });
    const output = lines.join('');
    for (const value of [
      email,
      code,
      token,
      client,
      cookie,
      'private-session-id',
    ]) {
      assert.ok(
        !output.includes(value),
        'request logs must omit private account data',
      );
    }
    const records = lines.map((line) => JSON.parse(line));
    assert.equal(records.length, requestIds.length);
    assert.equal(new Set(requestIds).size, requestIds.length);
    assert.ok(requestIds.every(Boolean));
    assert.deepEqual(
      records.map((record) => record.requestId),
      requestIds,
    );
    assert.deepEqual(
      records.map((record) => record.status),
      [200, 202, 204, 401, 204, 200, 204, 400, 503],
    );
    for (const record of records) {
      assert.equal(record.event, 'http.request');
      assert.equal(record.route, 'unmatched-or-static');
      assert.equal(record.outcome, 'finished');
      assert.ok(record.durationMs >= 0);
      assert.deepEqual(
        Object.keys(record).sort(),
        [
          'level',
          'time',
          'service',
          'requestId',
          'event',
          'method',
          'route',
          'status',
          'outcome',
          'durationMs',
          'msg',
        ].sort(),
      );
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
