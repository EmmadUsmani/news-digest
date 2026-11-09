// Explicit live acceptance, never included in automated tests. Credentials stay
// in memory; only the dedicated disposable reader's preferences are changed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { database } from '../apps/api/src/libs/db/connections';
import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';

const base = 'http://127.0.0.1:8000';
const origin = 'https://news-digest.exe.xyz';
const empty = { version: 1, hiddenTopics: {}, bookmarks: {} };
let stage = 'configuration';
let checks = 0;

async function request(
  path: string,
  status: number,
  cookie = '',
  body?: unknown,
) {
  stage = path;
  const response = await fetch(`${base}/api/account/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      'X-Forwarded-For': '192.0.2.193',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body === undefined
        ? {}
        : { Origin: origin, 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  // Never include payloads, actual cookies or response bodies in errors.
  if (response.status !== status) throw new Error('Unexpected HTTP status');
  if (response.headers.get('cache-control') !== 'no-store')
    throw new Error('Missing no-store');
  checks++;
  return response;
}
function cookieFrom(response: Response) {
  const value = response.headers.get('set-cookie');
  if (
    !value ||
    !value.includes('HttpOnly') ||
    !value.includes('Secure') ||
    !value.includes('SameSite=Lax')
  )
    throw new Error('Missing secure session cookie');
  return value.split(';')[0];
}
async function signedIn(cookie: string, expected: boolean, admin = false) {
  const response = await request('session', 200, cookie);
  if (
    JSON.stringify(await response.json()) !==
    JSON.stringify({ signedIn: expected, isAdmin: admin })
  )
    throw new Error('Unexpected session state');
}
async function main() {
  assert.equal(process.argv[2], '--live', 'Requires explicit --live opt-in');
  const env = parseEnv(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  assert.equal(env.ACCOUNTS_ENABLED, '1');
  assert.equal(env.SIGNUP_MODE, 'invite');
  assert.equal(env.ACCOUNT_ORIGIN, origin);
  const adminEmail = env.ADMIN_EMAILS?.split(',')[0]?.trim().toLowerCase();
  assert.ok(
    adminEmail && env.ACCOUNT_MAILBOX_PATH,
    'Missing private configuration',
  );
  if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
  const pool = database();
  const mailbox = new FileLoginCodeDelivery(env.ACCOUNT_MAILBOX_PATH);
  const email = `acceptance-${randomUUID()}@example.invalid`;
  let admin = '';
  let friend = '';
  let deleted = false;
  try {
    await request('code', 202, '', { email: adminEmail });
    const code = await mailbox.latest(adminEmail, new Date());
    if (!code) throw new Error('No unexpired admin code');
    admin = cookieFrom(
      await request('redeem', 204, '', { email: adminEmail, code }),
    );
    await signedIn(admin, true, true);
    await request('redeem', 401, '', { email: adminEmail, code });
    const invitation = await request('links', 201, admin, { email });
    const { token } = (await invitation.json()) as { token: string };
    friend = cookieFrom(await request('link-redeem', 204, '', { token }));
    await request('link-redeem', 401, '', { token });
    await signedIn(friend, true);
    await request('links', 403, friend, { email });
    await request('sessions/revoke', 403, friend, {
      userId: '00000000-0000-4000-8000-000000000193',
    });
    await request('code', 202, '', { email });
    const friendCode = await mailbox.latest(email, new Date());
    if (!friendCode) throw new Error('No unexpired reader code');
    const second = cookieFrom(
      await request('redeem', 204, '', { email, code: friendCode }),
    );
    await signedIn(second, true);
    const updatedAt = Date.now();
    const changes = {
      ...empty,
      hiddenTopics: { 'acceptance-only': { hidden: true, updatedAt } },
      bookmarks: {
        'acceptance-only': {
          updatedAt,
          copy: {
            title: 'Disposable acceptance bookmark',
            url: 'https://example.invalid/acceptance',
            attribution: 'Acceptance check',
            excerpt: 'Synthetic bookmark; never published as live content.',
            platform: 'story',
            editionId: 'acceptance-only',
          },
        },
      },
    };
    await request('sync', 200, friend, changes);
    const state = (await (
      await request('sync', 200, second, empty)
    ).json()) as typeof changes;
    if (!state.hiddenTopics['acceptance-only']?.hidden)
      throw new Error('Cross-device sync failed');
    assert.deepEqual(state.bookmarks, changes.bookmarks);
    await request('sync', 200, second, {
      ...empty,
      hiddenTopics: {
        'acceptance-only': { hidden: false, updatedAt: updatedAt + 1 },
      },
      bookmarks: {
        'acceptance-only': { copy: null, updatedAt: updatedAt + 1 },
      },
    });
    const stale = (await (
      await request('sync', 200, friend, changes)
    ).json()) as typeof changes;
    if (
      stale.hiddenTopics['acceptance-only']?.hidden !== false ||
      stale.bookmarks['acceptance-only']?.copy !== null
    )
      throw new Error('Stale write won');
    const persisted = (await (
      await request('sync', 200, second, empty)
    ).json()) as typeof changes;
    if (
      persisted.bookmarks['acceptance-only']?.copy !== null ||
      persisted.hiddenTopics['acceptance-only']?.hidden !== false
    )
      throw new Error('Removal did not persist across devices');
    await request('logout-all', 204, second, {});
    await signedIn(friend, false);
    await signedIn(second, false);
    await request('sync', 401, friend, empty);
    const nextInvitation = (await (
      await request('links', 201, admin, { email })
    ).json()) as { token: string };
    friend = cookieFrom(
      await request('link-redeem', 204, '', { token: nextInvitation.token }),
    );
    // Read only this random reader's ID; all live mutations use public handlers.
    stage = 'disposable reader identity lookup';
    const target = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (target.rows.length !== 1) throw new Error('Missing disposable reader');
    await request('code', 202, '', { email });
    const revokeCode = await mailbox.latest(email, new Date());
    if (!revokeCode) throw new Error('No unexpired reader code');
    const revokeSecond = cookieFrom(
      await request('redeem', 204, '', { email, code: revokeCode }),
    );
    const revoked = await request('sessions/revoke', 200, admin, {
      userId: target.rows[0].id,
    });
    assert.deepEqual(await revoked.json(), { revoked: 2 });
    await signedIn(friend, false);
    await signedIn(revokeSecond, false);
    await request('sync', 401, friend, empty);
    await request('sync', 401, revokeSecond, empty);
    await signedIn(admin, true, true);
    stage = 'disposable reader revocation audit';
    const audit = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM admin_audit_log
       WHERE recipient_email = $1 AND action = 'reader_sessions_revoked'`,
      [email],
    );
    assert.equal(audit.rows[0].count, '1');
    const recovery = (await (
      await request('links', 201, admin, { email })
    ).json()) as { token: string };
    friend = cookieFrom(
      await request('link-redeem', 204, '', { token: recovery.token }),
    );
    await request('delete', 400, friend, { confirmation: 'wrong' });
    await request('delete', 204, friend, { confirmation: 'DELETE' });
    deleted = true;
    await signedIn(friend, false);
    await request('delete', 401, friend, { confirmation: 'DELETE' });
    await request('link-redeem', 401, '', { token: nextInvitation.token });
    if (await mailbox.latest(email, new Date()))
      throw new Error('Deleted reader mailbox retained');
    await signedIn(admin, true, true);
  } catch {
    console.error(
      `Acceptance failed before cleanup at ${stage}; credentials withheld`,
    );
    throw new Error('Live acceptance failed');
  } finally {
    // Delete only this run's random identity. Never delete or revoke owner devices.
    if (friend && !deleted) {
      try {
        // Reauthenticate if a failure happened after revoking the test sessions.
        const cleanup = (await (
          await request('links', 201, admin, { email })
        ).json()) as { token: string };
        friend = cookieFrom(
          await request('link-redeem', 204, '', { token: cleanup.token }),
        );
        await request('delete', 204, friend, { confirmation: 'DELETE' });
      } catch {
        console.error('Disposable reader cleanup requires review');
      }
    }
    try {
      if (admin) await request('logout', 204, admin, {});
    } finally {
      await pool.end();
    }
  }
  console.log(
    `${checks} deployed-loopback lifecycle checks pass: code/link login and replay, two-device topic/bookmark sync and persisted tombstones/stale refusal, reader privilege refusal, all-device logout, audited admin-target two-session revocation/replay refusal and disposable deletion/mailbox cleanup. Owner session signed out; no schedule or owner preference writes. Proxy/browser and expiry acceptance remain separate.`,
  );
}
void main().catch(() => {
  console.error(
    `Live account acceptance failed at ${stage}; credentials withheld`,
  );
  process.exitCode = 1;
});
