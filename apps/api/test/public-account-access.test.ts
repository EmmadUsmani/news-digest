import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';

import { AccountHandlers } from '../src/modules/accounts/adapters/account-handlers';
import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';
import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { ReaderSessions } from '../src/modules/accounts/application/sessions';
import type { ReaderSession } from '../src/modules/accounts/domain/session';
import { publicAccountAccess } from '../src/public-account-access';

void test('prepared public access validates real account cookies, renewal, freshness and revocation over HTTP', async () => {
  const start = new Date('2026-11-09T08:00:00Z');
  let now = start;
  let row: ReaderSession | null = null;
  let unavailable = false;
  let reads = 0;
  const admins = new Set(['owner@example.test']);
  const sessions = new ReaderSessions(
    {
      async create(input) {
        row = {
          ...input,
          id: 'session',
          email: 'owner@example.test',
          createdAt: input.now,
          cookieRenewedAt: input.now,
        };
        return row;
      },
      async findByTokenHash(hash) {
        reads++;
        if (unavailable) throw new Error('private database detail');
        return row?.tokenHash === hash ? row : null;
      },
      async claimCookieRenewal(_id, cutoff, renewedAt) {
        if (!row || row.cookieRenewedAt > cutoff) return false;
        row.cookieRenewedAt = renewedAt;
        return true;
      },
      async deleteByTokenHash() {
        row = null;
      },
      async deleteByUserId() {
        row = null;
      },
    },
    new CryptoSessionTokens(),
    admins,
  );
  const issued = await sessions.issueVerifiedIdentity(
    'user',
    'owner@example.test',
    start,
  );
  const cookie = issued.cookie.split(';')[0];
  const handlers = new AccountHandlers(
    new AccountRequestBoundary('https://reader.example.test'),
    {
      async request() {
        throw new Error('unused');
      },
    },
    {
      async redeem() {
        throw new Error('unused');
      },
    },
    sessions,
  );
  const access = publicAccountAccess(
    true,
    () => handlers,
    () => now,
  );
  const server = createServer((request, response) => {
    void access(request, response, () => response.writeHead(204).end());
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const check = async (
    path: string,
    status: number,
    value?: string,
    method = 'GET',
  ) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(value ? { cookie: value } : {}),
        'x-exedev-email': 'owner@example.test',
      },
    });
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(await response.text(), '');
    return response;
  };
  try {
    await check('/api/admin/profile', 404);
    await check('/api/admin/profile', 404, `${cookie}; ${cookie}`);
    await check('/api/admin/profile', 404, '__Host-reader_session=malformed');
    assert.equal(reads, 0);
    await check('/api/admin/profile', 204, cookie);
    now = new Date(start.getTime() + 86_400_000);
    const renewed = await check('/api/admin/profile', 204, cookie);
    assert.equal(renewed.headers.get('set-cookie'), issued.cookie);
    assert.equal(
      (await check('/api/admin/profile', 204, cookie)).headers.get(
        'set-cookie',
      ),
      null,
    );
    admins.clear();
    await check('/api/admin/profile', 404, cookie);
    await check('/api/account/logout', 204, cookie, 'POST');
    admins.add('owner@example.test');
    now = new Date(start.getTime() + 7 * 86_400_000);
    await check('/api/admin/profile', 404, cookie);
    await check('/api/account/logout', 204, cookie, 'POST');
    unavailable = true;
    await check('/api/admin/profile', 503, cookie);
    await check('/api/editions/latest', 204, cookie);
    unavailable = false;
    await sessions.signOut(cookie.split('=')[1]);
    await check('/api/account/logout', 404, cookie, 'POST');
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  assert.throws(
    () => publicAccountAccess(true, () => null),
    /requires accounts/,
  );
  let next = false;
  const disabled = publicAccountAccess(false, () => {
    throw new Error('must stay lazy');
  });
  // Disabled middleware does not inspect either transport object.
  await disabled({} as never, {} as never, () => {
    next = true;
  });
  assert.equal(next, true);
});
