import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import {
  validateXCaps,
  xDiscoveryCost,
} from '../src/modules/social/domain/x-discovery-budget';

const price = {
  inputPerMillion: 1.25,
  outputPerMillion: 2.5,
  perPost: 0.005,
  perProfile: 0.01,
};
const usage = {
  inputTokens: 1,
  outputTokens: 1,
  postsFetched: 19,
  profilesFetched: 2,
};
void test('X billing counts all fetched posts/profiles, rounds up and bounds app caps', () => {
  assert.equal(xDiscoveryCost(usage, price), 115004);
  assert.equal(
    xDiscoveryCost({ ...usage, postsFetched: 38, profilesFetched: 0 }, price),
    190004,
  );
  assert.throws(() => xDiscoveryCost({ ...usage, postsFetched: -1 }, price));
  assert.throws(() => xDiscoveryCost({ ...usage, inputTokens: 1.5 }, price));
  assert.throws(() => xDiscoveryCost(usage, { ...price, perPost: Infinity }));
  assert.throws(() =>
    xDiscoveryCost({ ...usage, postsFetched: Number.MAX_SAFE_INTEGER }, price),
  );
  assert.throws(() =>
    validateXCaps({ dailyMicros: 400001, monthlyMicros: 12000000 }),
  );
  assert.throws(() =>
    validateXCaps({ dailyMicros: 400000, monthlyMicros: 12000001 }),
  );
});

void test('X ledger serializes separate caps, retains uncertainty, reconciles usage and durably blocks depleted credits', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const ids: string[] = [];
  const reserve = async (amount: number) => {
    const id = await ledger.reserve('grok-4.3', 'offline-ledger', amount);
    if (id) ids.push(id);
    return id;
  };
  try {
    assert.equal((await ledger.status()).availableMicros, 400000);
    const concurrent = await Promise.all(
      Array.from({ length: 8 }, () => reserve(200000)),
    );
    const accepted = concurrent.filter((id): id is string => id !== null);
    assert.equal(accepted.length, 2);
    assert.equal(await reserve(1), null);
    await ledger.settle(accepted[0], usage, price);
    assert.equal((await ledger.status()).availableMicros, 84996);
    await assert.rejects(ledger.settle(accepted[0], usage, price));
    await ledger.fail(accepted[1], 'uncertain');
    await db.query(
      "UPDATE x_discovery_calls SET created_at=now()-interval '2 months' WHERE id=$1",
      [accepted[1]],
    );
    assert.equal((await ledger.status()).reservedMicros, 200000);
    assert.equal((await ledger.status()).availableMicros, 84996);
    // Late usage can reconcile an uncertain call; a missing usage response cannot release it.
    await ledger.settle(
      accepted[1],
      { inputTokens: 0, outputTokens: 0, postsFetched: 1, profilesFetched: 0 },
      price,
    );
    assert.equal((await ledger.status()).reservedMicros, 0);
    assert.equal((await ledger.status()).availableMicros, 284996);
    const rejected = await reserve(10000);
    assert.ok(rejected);
    await ledger.fail(rejected, 'rejected');
    assert.equal((await ledger.status()).availableMicros, 284996);
    // A remote overrun is recorded in full, never clamped to the estimate.
    const overrun = await reserve(1);
    assert.ok(overrun);
    await ledger.settle(
      overrun,
      { ...usage, postsFetched: 60, profilesFetched: 0 },
      price,
    );
    assert.equal((await ledger.status()).availableMicros, 0);
    const { rows } = await db.query(
      'SELECT error_code,cost_micros,purpose,posts_fetched,profiles_fetched FROM x_discovery_calls WHERE id=$1',
      [overrun],
    );
    assert.deepEqual(rows[0], {
      error_code: 'estimate-exceeded',
      cost_micros: '300004',
      purpose: 'x-discovery',
      posts_fetched: '60',
      profiles_fetched: '0',
    });
    // Prior-day settled spend releases daily funds but continues to consume month funds.
    await db.query(
      "UPDATE x_discovery_calls SET created_at=date_trunc('month',now())-interval '1 day' WHERE id=ANY($1::uuid[])",
      [ids],
    );
    assert.equal((await ledger.status()).availableMicros, 400000);
    // A tight monthly cap applies even when the daily cap has room.
    const monthly = new PostgresXDiscoveryLedger(db, {
      dailyMicros: 400000,
      monthlyMicros: 100,
    });
    const monthId = await monthly.reserve('grok-4.3', 'offline-ledger', 100);
    assert.ok(monthId);
    ids.push(monthId);
    assert.equal(await monthly.reserve('grok-4.3', 'offline-ledger', 1), null);
    await monthly.fail(monthId, 'rejected');
    const depleted = await reserve(10000);
    assert.ok(depleted);
    await ledger.fail(depleted, 'credits-depleted');
    assert.equal(
      (await new PostgresXDiscoveryLedger(db).status()).blocked,
      true,
    );
    await db.query(
      "UPDATE x_discovery_provider_block SET created_at=now()-interval '2 months'",
    );
    assert.equal(await reserve(1), null);
    // No caller-supplied error/provider text is stored; invalid reservation rolls back.
    await assert.rejects(ledger.fail(crypto.randomUUID(), 'credits-depleted'));
    await assert.rejects(ledger.reserve('grok-4.3', 'offline-ledger', 0));
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.query('DELETE FROM x_discovery_provider_block');
    await db.end();
  }
});
