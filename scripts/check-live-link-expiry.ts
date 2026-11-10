// Explicit two-run live check. The unredeemed credential stays outside the repo.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { database } from '../apps/api/src/libs/db/connections';
import { FileLoginCodeDelivery } from '../apps/api/src/modules/accounts/adapters/file-login-code-delivery';

const directory = `${homedir()}/.local/state/news-digest`;
const path = `${directory}/link-expiry-acceptance.json`;
const origin = 'https://news-digest.exe.xyz';
async function request(
  route: string,
  status: number,
  body: unknown,
  cookie = '',
) {
  const response = await fetch(`http://127.0.0.1:8000/api/account/${route}`, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'X-Forwarded-For': '192.0.2.194',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  if (response.status !== status) throw new Error('Unexpected HTTP status');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return response;
}
async function main() {
  const mode = process.argv[3];
  assert.ok(
    process.argv[2] === '--live' && ['prepare', 'verify'].includes(mode),
  );
  const env = parseEnv(
    await readFile(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  assert.equal(env.ACCOUNTS_ENABLED, '1');
  assert.equal(env.SIGNUP_MODE, 'invite');
  assert.equal(env.ACCOUNT_ORIGIN, origin);
  if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL;
  const pool = database();
  let admin = '';
  try {
    if (mode === 'prepare') {
      // Never overwrite a pending credential or its evidence.
      const existing = await stat(path).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code !== 'ENOENT') throw error;
          return null;
        },
      );
      assert.equal(existing, null, 'Receipt already exists; use verify');
      const adminEmail = env.ADMIN_EMAILS?.split(',')[0]?.trim().toLowerCase();
      assert.ok(adminEmail && env.ACCOUNT_MAILBOX_PATH);
      await request('code', 202, { email: adminEmail });
      const mailbox = new FileLoginCodeDelivery(env.ACCOUNT_MAILBOX_PATH);
      const code = await mailbox.latest(adminEmail, new Date());
      assert.ok(code);
      const response = await request('redeem', 204, {
        email: adminEmail,
        code,
      });
      const cookie = response.headers.get('set-cookie');
      assert.ok(cookie?.includes('HttpOnly') && cookie.includes('Secure'));
      admin = cookie.split(';')[0];
      const email = `expiry-${randomUUID()}@example.invalid`;
      const link = (await (
        await request('links', 201, { email }, admin)
      ).json()) as { token: string; expiresAt: string };
      assert.match(link.token, /^[A-Za-z0-9_-]{43}$/);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      await writeFile(path, JSON.stringify({ ...link, email }), {
        mode: 0o600,
        flag: 'wx',
      });
      console.log(
        `Unredeemed disposable link stored privately; verify after ${link.expiresAt}.`,
      );
    }
    assert.equal((await stat(path)).mode & 0o777, 0o600);
    const receipt = JSON.parse(await readFile(path, 'utf8')) as {
      token: string;
      email: string;
      expiresAt: string;
      verifiedAt?: string;
    };
    assert.match(receipt.email, /^expiry-[0-9a-f-]+@example\.invalid$/);
    assert.match(receipt.token, /^[A-Za-z0-9_-]{43}$/);
    const hash = createHash('sha256').update(receipt.token).digest('hex');
    const result = await pool.query<{
      lifetime: number;
      expiresAt: Date;
      consumed: boolean;
    }>(
      `SELECT EXTRACT(EPOCH FROM (expires_at-created_at))::int AS lifetime, expires_at AS "expiresAt", consumed FROM sign_in_links WHERE token_hash=$1 AND email=$2`,
      [hash, receipt.email],
    );
    assert.equal(result.rows.length, 1);
    const row = result.rows[0];
    assert.equal(row.lifetime, 86400);
    assert.equal(row.consumed, false);
    const identities = await pool.query(
      'SELECT count(*)::int AS count FROM users WHERE email=$1',
      [receipt.email],
    );
    assert.equal(identities.rows[0].count, 0);
    assert.equal(
      new Date(row.expiresAt).toISOString(),
      new Date(receipt.expiresAt).toISOString(),
    );
    if (mode === 'verify') {
      if (Date.now() <= new Date(row.expiresAt).getTime()) {
        console.log(
          `Pending natural expiry; rerun verify after ${receipt.expiresAt}. No redemption attempted.`,
        );
        return;
      }
      const response = await request('link-redeem', 401, {
        token: receipt.token,
      });
      assert.equal(response.headers.get('set-cookie'), null);
      const unchanged = await pool.query(
        'SELECT consumed FROM sign_in_links WHERE token_hash=$1',
        [hash],
      );
      assert.equal(unchanged.rows[0]?.consumed, false);
      const identities = await pool.query(
        'SELECT count(*)::int AS count FROM users WHERE email=$1',
        [receipt.email],
      );
      assert.equal(identities.rows[0].count, 0);
      receipt.verifiedAt = new Date().toISOString();
      await writeFile(path, JSON.stringify(receipt), { mode: 0o600 });
      console.log(
        'Natural 24-hour link expiry passes: HTTP 401, no cookie, unconsumed stored link. Private receipt retained.',
      );
    } else {
      console.log(
        'Stored link has an unchanged 86400-second lifetime and is unconsumed. No reader identity created.',
      );
    }
  } finally {
    try {
      if (admin) await request('logout', 204, {}, admin);
    } finally {
      await pool.end();
    }
  }
}
void main().catch(() => {
  console.error(
    'Live link-expiry check failed; credentials withheld. Inspect private receipt before retrying.',
  );
  process.exitCode = 1;
});
