import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresDevelopmentSpendRepository } from '../src/modules/digests/database/development-spend.repository';
import type { DevelopmentSpendPort } from '../src/modules/digests/domain/development-spend.port';

void test('candidate development ledger serializes lifetime holds and preserves confirmed charges', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const repository: DevelopmentSpendPort =
    new PostgresDevelopmentSpendRepository(db);
  const id = () => crypto.randomUUID();
  try {
    await db.query(readFileSync('ops/backups/development_pools.sql', 'utf8'));
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
    await db.query(
      'DROP TABLE IF EXISTS development_spend_reservations, development_spend_pools',
    );
    await db.end();
  }
});
