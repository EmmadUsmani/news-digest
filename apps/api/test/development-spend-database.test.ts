import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresDevelopmentSpendRepository } from '../src/modules/digests/database/development-spend.repository';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

void test('migrated development ledger serializes lifetime holds and preserves confirmed charges', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const repository: DevelopmentSpendPort =
    new PostgresDevelopmentSpendRepository(db);
  const id = () => crypto.randomUUID();
  try {
    const productionSnapshot = async () => {
      const snapshots = [];
      for (const table of [
        'llm_calls',
        'x_discovery_calls',
        'scheduled_ai_budget_days',
      ]) {
        const result = await db.query(
          `SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text, '[]')) AS fingerprint FROM ${table} t`,
        );
        snapshots.push(result.rows[0].fingerprint);
      }
      return snapshots;
    };
    const productionBefore = await productionSnapshot();
    assert.deepEqual(await repository.status('anthropic'), {
      provider: 'anthropic',
      chargedMicros: 0,
      heldMicros: 0,
      unresolvedCount: 0,
      committedMicros: 0,
      capMicros: 5_000_000,
      stopAtMicros: 3_750_000,
      availableMicros: 3_750_000,
      mustReport: false,
    });
    // Three concurrent requests fit the 75% threshold, the fourth cannot race through.
    const ids = Array.from({ length: 4 }, id);
    const outcomes = await Promise.all(
      ids.map((key) => repository.reserve(key, 'anthropic', 1_250_000)),
    );
    assert.equal(outcomes.filter((result) => result.admitted).length, 3);
    assert.equal(outcomes.filter((result) => result.mustReport).length, 2);
    const held = await repository.status('anthropic');
    assert.equal(held.heldMicros, 3_750_000);
    assert.equal(held.unresolvedCount, 3);
    assert.equal(held.mustReport, true);
    const accepted = ids[outcomes.findIndex((result) => result.admitted)];
    assert.deepEqual(
      await repository.reserve(accepted, 'anthropic', 1_250_000),
      { admitted: true, replay: true },
    );
    await assert.rejects(
      repository.reserve(accepted, 'anthropic', 1),
      /Conflicting/,
    );
    assert.deepEqual(await repository.reserve(id(), 'anthropic', 1), {
      admitted: false,
      mustReport: true,
    });
    // Unknown outcomes keep their holds indefinitely, regardless of creation date.
    await db.query(
      "UPDATE development_spend_reservations SET created_at = '2000-01-01Z'",
    );
    assert.equal(
      (await repository.reserve(id(), 'anthropic', 1)).admitted,
      false,
    );
    await repository.settle(accepted, 250_000);
    await repository.settle(accepted, 250_000);
    const charged = await repository.status('anthropic');
    assert.equal(charged.chargedMicros, 250_000);
    assert.equal(charged.heldMicros, 2_500_000);
    assert.equal(charged.committedMicros, 2_750_000);
    assert.equal(charged.unresolvedCount, 2);
    assert.equal(charged.availableMicros, 1_000_000);
    await assert.rejects(repository.settle(accepted, 0), /Conflicting/);
    assert.equal(
      (await repository.reserve(id(), 'anthropic', 1_000_000)).admitted,
      true,
    );
    // Pools are independent; real charges above the estimate are retained and stop admission.
    const x = id();
    assert.equal(
      (await repository.reserve(x, 'xai', 1_000_000)).admitted,
      true,
    );
    assert.equal((await repository.settle(x, 2_100_000)).mustReport, true);
    const overrun = await repository.status('xai');
    assert.equal(overrun.chargedMicros, 2_100_000);
    assert.equal(overrun.heldMicros, 0);
    assert.equal(overrun.unresolvedCount, 0);
    assert.equal(overrun.availableMicros, 0);
    assert.equal(overrun.mustReport, true);
    assert.deepEqual(await repository.reserve(id(), 'xai', 1), {
      admitted: false,
      mustReport: true,
    });
    await assert.rejects(
      db.query(
        "UPDATE development_spend_pools SET cap_micros = 5000001 WHERE provider = 'anthropic'",
      ),
    );
    await assert.rejects(
      db.query(
        "UPDATE development_spend_pools SET cap_micros = -1 WHERE provider = 'xai'",
      ),
    );
    await assert.rejects(repository.reserve(id(), 'anthropic', 0));
    await assert.rejects(repository.settle(id(), -1));
    await assert.rejects(repository.settle(id(), 1), /Missing/);
    const total = await db.query(
      'SELECT count(*)::int AS count FROM development_spend_reservations',
    );
    assert.equal(total.rows[0].count, 5);
    const released = id();
    await db.query(
      "UPDATE development_spend_pools SET cap_micros = 5000000 WHERE provider = 'anthropic'",
    );
    const settled =
      ids[
        outcomes.findIndex(
          (result, index) => result.admitted && ids[index] !== accepted,
        )
      ];
    await repository.settle(settled, 0);
    assert.equal(
      (await repository.reserve(released, 'anthropic', 1_250_000)).admitted,
      true,
    );
    assert.equal((await repository.settle(released, 0)).mustReport, false);
    const releasedStatus = await repository.status('anthropic');
    assert.equal(releasedStatus.chargedMicros, 250_000);
    assert.equal(releasedStatus.heldMicros, 2_250_000);
    assert.equal(releasedStatus.unresolvedCount, 2);
    // Duplicate callers share one hold; settlement retries cannot double-charge it.
    const concurrent = id();
    const duplicates = await Promise.all(
      Array.from({ length: 6 }, () =>
        repository.reserve(concurrent, 'anthropic', 100_000),
      ),
    );
    assert.equal(
      duplicates.filter((result) => result.admitted && !result.replay).length,
      1,
    );
    assert.equal(
      duplicates.filter((result) => result.admitted && result.replay).length,
      5,
    );
    await Promise.all(
      Array.from({ length: 6 }, () => repository.settle(concurrent, 50_000)),
    );
    const afterRetries = await repository.status('anthropic');
    assert.equal(afterRetries.chargedMicros, 300_000);
    assert.equal(afterRetries.heldMicros, releasedStatus.heldMicros);
    assert.equal(afterRetries.unresolvedCount, releasedStatus.unresolvedCount);
    // Competing confirmed amounts have exactly one winner; the loser rolls back.
    const disputed = id();
    assert.equal(
      (await repository.reserve(disputed, 'anthropic', 100_000)).admitted,
      true,
    );
    const settlements = await Promise.allSettled([
      repository.settle(disputed, 20_000),
      repository.settle(disputed, 30_000),
    ]);
    assert.equal(settlements.filter((r) => r.status === 'fulfilled').length, 1);
    const failure = settlements.find((r) => r.status === 'rejected');
    assert.ok(failure && failure.status === 'rejected');
    assert.match(String(failure.reason), /Conflicting development settlement/);
    const winner = settlements[0].status === 'fulfilled' ? 20_000 : 30_000;
    const afterConflict = await repository.status('anthropic');
    assert.equal(afterConflict.chargedMicros, 300_000 + winner);
    assert.equal(afterConflict.heldMicros, releasedStatus.heldMicros);
    assert.equal(afterConflict.unresolvedCount, releasedStatus.unresolvedCount);
    await repository.settle(disputed, winner);
    assert.deepEqual(await repository.status('anthropic'), afterConflict);
    // Independent connection pools model process loss without clearing durable holds.
    const durableId = id();
    const firstConnection = database();
    try {
      const firstProcess = new PostgresDevelopmentSpendRepository(
        firstConnection,
      );
      assert.equal(
        (await firstProcess.reserve(durableId, 'anthropic', 100_000)).admitted,
        true,
      );
    } finally {
      await firstConnection.end();
    }
    const durableStatus = await repository.status('anthropic');
    assert.equal(durableStatus.heldMicros, afterConflict.heldMicros + 100_000);
    const secondConnection = database();
    try {
      const restarted = new PostgresDevelopmentSpendRepository(
        secondConnection,
      );
      assert.deepEqual(await restarted.status('anthropic'), durableStatus);
      assert.deepEqual(
        await restarted.reserve(durableId, 'anthropic', 100_000),
        {
          admitted: true,
          replay: true,
        },
      );
      await restarted.settle(durableId, 40_000);
      await restarted.settle(durableId, 40_000);
      const recovered = await restarted.status('anthropic');
      assert.equal(
        recovered.chargedMicros,
        afterConflict.chargedMicros + 40_000,
      );
      assert.equal(recovered.heldMicros, afterConflict.heldMicros);
      assert.equal(recovered.unresolvedCount, afterConflict.unresolvedCount);
      assert.deepEqual(await repository.status('anthropic'), recovered);
    } finally {
      await secondConnection.end();
    }
    assert.deepEqual(await productionSnapshot(), productionBefore);
    // A lowered/disabled pool is respected; release requires explicit confirmed zero cost.
    await db.query(
      "UPDATE development_spend_pools SET cap_micros = 0 WHERE provider = 'anthropic'",
    );
    assert.equal(
      (await repository.reserve(id(), 'anthropic', 1)).admitted,
      false,
    );
    assert.equal((await repository.status('anthropic')).mustReport, true);
  } finally {
    await db.query('DELETE FROM development_spend_reservations');
    await db.query(
      "UPDATE development_spend_pools SET cap_micros = CASE provider WHEN 'anthropic' THEN 5000000 ELSE 2000000 END",
    );
    await db.end();
  }
});
