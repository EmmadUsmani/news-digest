import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { CryptoLoginCodeSecrets } from '../src/modules/accounts/adapters/login-code-secrets';
import { CryptoSessionTokens } from '../src/modules/accounts/adapters/session-tokens';
import { LoginCodes } from '../src/modules/accounts/application/login-codes';
import { LoginExchange } from '../src/modules/accounts/application/login-exchange';
import { ReaderSessions } from '../src/modules/accounts/application/sessions';
import { PostgresReaderIdentityRepository } from '../src/modules/accounts/database/identity.repository';
import { PostgresLoginCodeRepository } from '../src/modules/accounts/database/login-code.repository';
import { PostgresRecipientCoordination } from '../src/modules/accounts/database/recipient-coordination';
import { PostgresSessionRepository } from '../src/modules/accounts/database/session.repository';

void test('verified exchange creates one identity, rejects replay and issues private sessions', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const identities = new PostgresReaderIdentityRepository();
  const other = new PostgresReaderIdentityRepository();
  const challenges = new PostgresLoginCodeRepository();
  const repository = new PostgresSessionRepository();
  const tokens = new CryptoSessionTokens();
  const sessions = new ReaderSessions(
    repository,
    tokens,
    new Set(['exchange@example.test']),
  );
  const pool = database();
  const email = 'exchange@example.test';
  const now = new Date('2026-11-08T19:00:00Z');
  let code = '';
  let allowed = true;
  const recipients = new PostgresRecipientCoordination();
  const codes = new LoginCodes(
    challenges,
    new CryptoLoginCodeSecrets(Buffer.alloc(32, 3)),
    {
      deliver(_email, value) {
        code = value;
        return Promise.resolve();
      },
    },
    {
      allow: () => Promise.resolve(allowed),
      eligible: () => Promise.resolve(true),
    },
    recipients,
  );
  const exchange = new LoginExchange(codes, identities, sessions);
  const redeem = (value = code) =>
    exchange.redeem(' EXCHANGE@Example.test ', value, 'test-client', now);
  try {
    assert.equal(await redeem('000000'), null);
    assert.equal(
      (await pool.query('SELECT id FROM users WHERE email=$1', [email]))
        .rowCount,
      0,
    );
    await codes.request(email, 'test-client', now);
    allowed = false;
    assert.equal(await redeem(), null);
    allowed = true;
    const results = await Promise.all(
      Array.from({ length: 8 }, () => redeem()),
    );
    const winners = results.filter((value) => value !== null);
    assert.equal(winners.length, 1);
    assert.equal(await redeem(), null);
    const issued = winners[0];
    assert.match(issued.cookie, /; HttpOnly; Secure; SameSite=Lax;/);
    const token = issued.cookie.split(';')[0].split('=')[1];
    const auth = await sessions.authenticate(token, now);
    assert.equal(auth?.isAdmin, true);
    const ids = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? identities : other).findOrCreateVerified(
          email,
          new Date(now.getTime() + 1000),
        ),
      ),
    );
    assert.deepEqual(new Set(ids), new Set([auth.userId]));
    const user = (
      await pool.query('SELECT created_at FROM users WHERE email=$1', [email])
    ).rows[0];
    assert.equal(user.created_at.toISOString(), now.toISOString());
    const stored = (
      await pool.query('SELECT token_hash FROM sessions WHERE id=$1', [
        issued.sessionId,
      ])
    ).rows[0];
    assert.equal(stored.token_hash, tokens.hash(token));
    assert.notEqual(stored.token_hash, token);
    await codes.request(email, 'test-client', now);
    const second = await redeem();
    assert.ok(second);
    assert.notEqual(second.sessionId, issued.sessionId);
    // Failure after consuming a challenge cannot turn that proof into a reusable login.
    await codes.request(email, 'test-client', now);
    const broken = new LoginExchange(
      codes,
      {
        findOrCreateVerified() {
          return Promise.reject(new Error('storage unavailable'));
        },
      },
      sessions,
    );
    await assert.rejects(
      broken.redeem(email, code, 'test-client', now),
      /storage unavailable/,
    );
    assert.equal(await redeem(), null);
    await sessions.signOut(token);
    assert.equal(await sessions.authenticate(token, now), null);
  } finally {
    await pool.query('DELETE FROM login_codes WHERE email=$1', [email]);
    await pool.query('DELETE FROM users WHERE email=$1', [email]);
    await Promise.all([
      identities.onModuleDestroy(),
      other.onModuleDestroy(),
      challenges.onModuleDestroy(),
      repository.onModuleDestroy(),
      recipients.onModuleDestroy(),
      pool.end(),
    ]);
  }
});
