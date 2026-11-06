import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';
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
    const toolCalls = [
      {
        name: 'x_keyword_search',
        input: '{"query":"NBA min_faves:100","mode":"Top"}',
      },
    ];
    await ledger.settle(accepted[0], usage, price, toolCalls);
    const stored = await db.query(
      'SELECT tool_calls FROM x_discovery_calls WHERE id=$1',
      [accepted[0]],
    );
    assert.deepEqual(stored.rows[0].tool_calls, toolCalls);
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

void test('X ledger uses inclusive UTC budget boundaries and retains old unresolved holds', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const ids: string[] = [];
  const insert = async (status: string, amount: number, boundary: string) => {
    const id = crypto.randomUUID();
    ids.push(id);
    // Fixture dates use explicit offsets and UTC truncation, independent of session timezone.
    await db.query(
      `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
       VALUES($1,'grok-4.3','boundary-fixture',$2,$3,$4,${boundary})`,
      [id, status, amount, status === 'succeeded' ? amount : null],
    );
  };
  const day =
    "date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'";
  const month =
    "date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'";
  try {
    await insert('succeeded', 100, day);
    await insert('succeeded', 200, month);
    await insert('succeeded', 50, `(${day})-interval '1 microsecond'`);
    await insert('succeeded', 400, `(${month})-interval '1 microsecond'`);
    await insert('pending', 800, "'2000-01-01T00:00:00-08:00'::timestamptz");
    await insert('uncertain', 1600, "'2000-01-01T08:00:00Z'::timestamptz");
    await insert('failed', 3200, day);
    const status = await ledger.status();
    const firstDay = (await db.query(`SELECT (${day})=(${month}) AS first`))
      .rows[0].first;
    assert.equal(status.todayMicros, firstDay ? 2700 : 2500);
    assert.equal(status.monthMicros, firstDay ? 2700 : 2750);
    assert.equal(status.reservedMicros, 2400);
    assert.equal(status.availableMicros, 400000 - status.todayMicros);
    // A fresh reader sees the same persisted totals and the tighter monthly cap wins.
    const monthly = new PostgresXDiscoveryLedger(db, {
      dailyMicros: 400000,
      monthlyMicros: status.monthMicros + 100,
    });
    assert.equal((await monthly.status()).availableMicros, 100);
    assert.equal(
      await monthly.reserve('grok-4.3', 'boundary-fixture', 101),
      null,
    );
    const exact = await monthly.reserve('grok-4.3', 'boundary-fixture', 100);
    assert.ok(exact);
    ids.push(exact);
    assert.equal((await monthly.status()).availableMicros, 0);
    await monthly.fail(exact, 'rejected');
    assert.equal((await monthly.status()).availableMicros, 100);
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.end();
  }
});

void test('X credit-depletion failure rolls back the reservation transition if persisting the block fails', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  let id: string | null = null;
  try {
    id = await ledger.reserve('grok-4.3', 'rollback-fixture', 10000);
    assert.ok(id);
    await db.query(
      `ALTER TABLE x_discovery_provider_block ADD CONSTRAINT fixture_reject_block CHECK (false) NOT VALID`,
    );
    await assert.rejects(ledger.fail(id, 'credits-depleted'));
    assert.equal((await ledger.status()).blocked, false);
    assert.equal((await ledger.status()).reservedMicros, 10000);
    assert.equal((await ledger.status()).availableMicros, 390000);
    await db.query(
      'ALTER TABLE x_discovery_provider_block DROP CONSTRAINT fixture_reject_block',
    );
    // Retry must still accept the open reservation, then persist the durable block.
    await ledger.fail(id, 'credits-depleted');
    const restarted = new PostgresXDiscoveryLedger(db);
    assert.equal((await restarted.status()).blocked, true);
    assert.equal((await restarted.status()).reservedMicros, 0);
    assert.equal(
      await restarted.reserve('grok-4.3', 'blocked-fixture', 1),
      null,
    );
    await assert.rejects(restarted.fail(id, 'rejected'));
    await assert.rejects(restarted.settle(id, usage, price));
    assert.equal((await restarted.status()).blocked, true);
  } finally {
    await db.query(
      'ALTER TABLE x_discovery_provider_block DROP CONSTRAINT IF EXISTS fixture_reject_block',
    );
    if (id) await db.query('DELETE FROM x_discovery_calls WHERE id=$1', [id]);
    await db.query('DELETE FROM x_discovery_provider_block');
    await db.end();
  }
});

void test('scheduled X admission is durable per topic/UTC day across failures and restarts', async () => {
  const db = database();
  const restartedDb = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const restarted = new PostgresXDiscoveryLedger(restartedDb);
  const ids: string[] = [];
  const reserve = async (
    instance: PostgresXDiscoveryLedger,
    day: string,
    topic = 'first',
  ) => {
    const id = await instance.reserve(
      'grok-4.3',
      crypto.randomUUID(),
      400000,
      { id: topic, name: topic },
      day,
    );
    if (id) ids.push(id);
    return id;
  };
  try {
    const {
      rows: [dates],
    } = await db.query<{ today: string; yesterday: string; tomorrow: string }>(
      `SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD') AS today,
       to_char((clock_timestamp() AT TIME ZONE 'UTC')-interval '1 day','YYYY-MM-DD') AS yesterday,
       to_char((clock_timestamp() AT TIME ZONE 'UTC')+interval '1 day','YYYY-MM-DD') AS tomorrow`,
    );
    await assert.rejects(reserve(ledger, '2026-02-30'), /Invalid scheduled/);
    await assert.rejects(reserve(ledger, '2026-1-01'), /Invalid scheduled/);
    assert.equal(await reserve(ledger, dates.yesterday), null);
    assert.equal(await reserve(ledger, dates.tomorrow), null);
    assert.equal(
      (
        await db.query(
          'SELECT 1 FROM x_discovery_calls WHERE scheduled_day IS NOT NULL',
        )
      ).rowCount,
      0,
    );

    // Budget denial does not consume the day; a definitively rejected manual hold
    // can release its budget before the first scheduled attempt is admitted.
    const manual = await ledger.reserve('grok-4.3', 'manual-fixture', 1);
    assert.ok(manual);
    ids.push(manual);
    assert.equal(await reserve(ledger, dates.today), null);
    await ledger.fail(manual, 'rejected');
    const attempts = await Promise.all([
      reserve(ledger, dates.today),
      reserve(restarted, dates.today),
    ]);
    const admitted = attempts.filter((id): id is string => id !== null);
    assert.equal(admitted.length, 1);
    assert.equal((await ledger.status()).reservedMicros, 400000);
    // Even a no-charge rejection consumes the scheduled attempt, preventing
    // a retry storm or changing topics to bypass the daily volume restriction.
    await ledger.fail(admitted[0], 'rejected');
    assert.equal((await ledger.status()).availableMicros, 400000);
    assert.equal(await reserve(restarted, dates.today), null);
    const other = await reserve(restarted, dates.today, 'other-topic');
    assert.ok(other);
    await restarted.fail(other, 'rejected');
    assert.equal(
      (
        await db.query(
          'SELECT 1 FROM x_discovery_calls WHERE scheduled_day=$1',
          [dates.today],
        )
      ).rowCount,
      2,
    );

    // Keep yesterday's durable claim but allow the next UTC day after restart.
    await db.query(
      'UPDATE x_discovery_calls SET scheduled_day=$2::date WHERE id=$1',
      [admitted[0], dates.yesterday],
    );
    const next = await reserve(restarted, dates.today);
    assert.ok(next);
    // The index also prevents bypasses from a writer without the advisory lock.
    await assert.rejects(
      db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,scheduled_day,requested_topic)
       VALUES($1,'grok-4.3','bypass-fixture','failed',1,$2,'{"id":"first","name":"first"}')`,
        [crypto.randomUUID(), dates.today],
      ),
      { code: '23505' },
    );
    await restarted.fail(next, 'uncertain');
    assert.equal(await reserve(ledger, dates.today), null);
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await restartedDb.end();
    await db.end();
  }
});

void test('scheduled topic projections share the budget lock and cap; retries cannot multiply calls', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const ids: string[] = [];
  const day = new Date().toISOString().slice(0, 10);
  try {
    await assert.rejects(
      ledger.reserve('grok-4.3', 'no-topic', 100000, undefined, day),
      /requires a topic/,
    );
    const reserve = async (id: string) => {
      const call = await ledger.reserve(
        'grok-4.3',
        'projection-fixture',
        100000,
        { id, name: id },
        day,
      );
      if (call) ids.push(call);
      return call;
    };
    const calls = await Promise.all(['a', 'b', 'c', 'd', 'e'].map(reserve));
    assert.equal(calls.filter(Boolean).length, 4);
    assert.equal((await ledger.status()).reservedMicros, 400000);
    for (const id of ids) await ledger.fail(id, 'rejected');
    for (let i = 0; i < calls.length; i++) {
      if (calls[i])
        assert.equal(await reserve(['a', 'b', 'c', 'd', 'e'][i]), null);
    }
    const unclaimed = ['a', 'b', 'c', 'd', 'e'][calls.indexOf(null)];
    assert.ok(await reserve(unclaimed));
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.end();
  }
});

void test('optional X admission waits for all verified open runs and consumes one durable low-yield slot', async () => {
  const db = database();
  const restartedDb = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const restarted = new PostgresXDiscoveryLedger(restartedDb);
  const ids: string[] = [];
  const day = new Date().toISOString().slice(0, 10);
  const externalIds = ['288001', '288002', '288003'];
  try {
    const { rows: topics } = await db.query<{ id: string; name: string }>(
      'SELECT id,name FROM topics WHERE enabled AND post_budget > 0 ORDER BY position',
    );
    assert.ok(topics.length >= 2);
    const parents: string[] = [];
    for (const topic of topics) {
      const id = await ledger.reserve(
        'grok-4.3',
        'optional-fixture',
        100000,
        topic,
        day,
        'open-topic',
      );
      assert.ok(id);
      ids.push(id);
      parents.push(id);
      await assert.rejects(ledger.completeVerification(id), /not completed/);
      await ledger.settle(
        id,
        {
          inputTokens: 0,
          outputTokens: 0,
          postsFetched: 0,
          profilesFetched: 0,
        },
        price,
      );
    }
    const optional = (
      instance: PostgresXDiscoveryLedger,
      index = 0,
      estimate = 100000,
    ) =>
      instance.reserve(
        'grok-4.3',
        'optional-fixture',
        estimate,
        topics[index],
        day,
        'story-reactions',
        parents[index],
      );
    const snapshots = new PostgresXSearchRepository(restartedDb);
    assert.deepEqual(await snapshots.completedOpenSearches(day), []);
    await assert.rejects(snapshots.completedOpenSearches('2026-02-30'));
    assert.deepEqual(await snapshots.completedOpenSearches('2000-01-01'), []);
    assert.equal(await optional(ledger), null);
    for (const id of parents.slice(0, -1))
      await ledger.completeVerification(id);
    assert.equal(await optional(ledger), null);
    await ledger.completeVerification(parents.at(-1)!);
    await ledger.completeVerification(parents[0]); // Idempotent after restart.

    assert.deepEqual(
      await snapshots.completedOpenSearches(day),
      topics.map((topic, index) => ({
        topicId: topic.id,
        openCallId: parents[index],
        openVerifiedAdditions: 0,
      })),
    );

    // Three new verified additions exclude the topic; old citations do not count.
    for (const externalId of externalIds) {
      await db.query(
        "INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html) VALUES('x',$1,'https://x.com/a/status/' || $1,'fixture','https://x.com/a','<p>fixture</p>')",
        [externalId],
      );
      await db.query(
        "INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url,new_candidate) VALUES($1,$2,$3,'https://x.com/a/status/' || $3,true)",
        [parents[0], topics[0].id, externalId],
      );
    }
    assert.equal(
      (await snapshots.completedOpenSearches(day))[0].openVerifiedAdditions,
      3,
    );
    assert.equal(await optional(ledger), null);
    await db.query(
      'UPDATE x_search_citations SET new_candidate=false WHERE call_id=$1 AND external_id=$2',
      [parents[0], externalIds[0]],
    );
    await db.query(
      'UPDATE x_search_citations SET new_candidate=NULL WHERE call_id=$1 AND external_id=$2',
      [parents[0], externalIds[0]],
    );
    assert.equal(await optional(ledger), null);
    assert.equal(
      (await snapshots.completedOpenSearches(day)).some(
        (row) => row.openCallId === parents[0],
      ),
      false,
    );
    await db.query(
      'UPDATE x_search_citations SET new_candidate=false WHERE call_id=$1 AND external_id=$2',
      [parents[0], externalIds[0]],
    );
    assert.equal(
      (await snapshots.completedOpenSearches(day))[0].openVerifiedAdditions,
      2,
    );
    // A budget denial does not consume the optional slot.
    assert.equal(await optional(ledger, 0, 400001), null);
    const attempts = await Promise.all([optional(ledger), optional(restarted)]);
    const admitted = attempts.filter((id): id is string => id !== null);
    assert.equal(admitted.length, 1);
    ids.push(...admitted);
    // Indexes protect the optional slot even from a writer bypassing the lock.
    await assert.rejects(
      db.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,scheduled_day,requested_topic,search_type,optional_parent_id)
         VALUES($1,'fixture','bypass-optional','failed',1,$2,$3,'account-list',$4)`,
        [crypto.randomUUID(), day, topics[0], parents[0]],
      ),
      { code: '23505' },
    );
    await ledger.fail(admitted[0], 'rejected');
    assert.equal(await optional(restarted), null);
    // The other topic has its own slot, but cannot reuse a different parent.
    assert.equal(
      await ledger.reserve(
        'grok-4.3',
        'wrong-parent',
        100000,
        topics[1],
        day,
        'account-list',
        parents[0],
      ),
      null,
    );
    const second = await optional(restarted, 1);
    assert.ok(second);
    ids.push(second);
    await restarted.fail(second, 'uncertain');
    assert.equal(await optional(ledger, 1), null);
    // Existing scheduled calls cannot acquire another first slot.
    assert.equal(
      await ledger.reserve(
        'grok-4.3',
        'first-again',
        100000,
        topics[0],
        day,
        'open-topic',
      ),
      null,
    );
    await assert.rejects(
      ledger.reserve(
        'grok-4.3',
        'bad-type',
        100000,
        topics[0],
        day,
        'open-topic',
        parents[0],
      ),
      /Invalid optional/,
    );
  } finally {
    await db.query(
      'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
      [ids],
    );
    await db.query(
      'DELETE FROM x_discovery_calls WHERE optional_parent_id=ANY($1::uuid[])',
      [ids],
    );
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.query(
      "DELETE FROM social_posts WHERE platform='x' AND external_id=ANY($1::text[])",
      [externalIds],
    );
    await db.end();
    await restartedDb.end();
  }
});

void test('fixed A/B admission is independent, durable and cannot mix with legacy scheduled slots', async () => {
  const db = database();
  const restartedDb = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const restarted = new PostgresXDiscoveryLedger(restartedDb);
  const ids: string[] = [];
  const {
    rows: [dates],
  } = await db.query<{ day: string }>(
    "SELECT to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD') AS day",
  );
  const reserve = async (
    instance: PostgresXDiscoveryLedger,
    topic: string,
    style: 'fixed-reactions' | 'fixed-trending' | 'open-topic',
  ) => {
    const id = await instance.reserve(
      'grok-4.3',
      crypto.randomUUID(),
      100000,
      { id: topic, name: topic },
      dates.day,
      style,
    );
    if (id) ids.push(id);
    return id;
  };
  try {
    await assert.rejects(
      ledger.reserve(
        'grok-4.3',
        'invalid',
        100000,
        { id: 'fixed', name: 'fixed' },
        undefined,
        'fixed-trending',
      ),
      /requires a scheduled/,
    );
    const attempts = await Promise.all([
      reserve(ledger, 'fixed', 'fixed-reactions'),
      reserve(restarted, 'fixed', 'fixed-reactions'),
    ]);
    const admitted = attempts.filter((id): id is string => id !== null);
    assert.equal(admitted.length, 1);
    await ledger.fail(admitted[0], 'rejected');
    assert.equal(await reserve(restarted, 'fixed', 'fixed-reactions'), null);
    const trending = await reserve(restarted, 'fixed', 'fixed-trending');
    assert.ok(trending);
    await restarted.fail(trending, 'uncertain');
    assert.equal(await reserve(ledger, 'fixed', 'fixed-trending'), null);
    assert.equal(await reserve(ledger, 'fixed', 'open-topic'), null);
    const legacy = await reserve(ledger, 'legacy', 'open-topic');
    assert.ok(legacy);
    await ledger.fail(legacy, 'rejected');
    assert.equal(await reserve(restarted, 'legacy', 'fixed-reactions'), null);
    assert.equal(await reserve(restarted, 'legacy', 'fixed-trending'), null);
    assert.equal((await ledger.status()).reservedMicros, 100000);
    // The ordinary shared daily budget still applies to distinct fixed slots.
    const hold = await ledger.reserve('grok-4.3', 'budget-fixture', 300000);
    assert.ok(hold);
    ids.push(hold);
    assert.equal(await reserve(ledger, 'new-topic', 'fixed-reactions'), null);
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.end();
    await restartedDb.end();
  }
});

void test('X execution evidence survives restart and settles atomically with empty-search usage', async () => {
  const db = database();
  const restartedDb = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const restarted = new PostgresXDiscoveryLedger(restartedDb);
  const ids: string[] = [];
  const emptyUsage = { ...usage, postsFetched: 0, profilesFetched: 0 };
  try {
    for (const execution of ['completed', 'unconfirmed', undefined] as const) {
      const id = await ledger.reserve('grok-4.3', 'execution-fixture', 100000);
      assert.ok(id);
      ids.push(id);
      // A call interrupted before settlement must not claim execution.
      const pending = await restartedDb.query(
        'SELECT execution FROM x_discovery_calls WHERE id=$1',
        [id],
      );
      assert.equal(pending.rows[0].execution, null);
      await ledger.settle(id, emptyUsage, price, [], execution);
      const saved = await restartedDb.query(
        'SELECT status, execution, posts_fetched, cost_micros FROM x_discovery_calls WHERE id=$1',
        [id],
      );
      assert.equal(saved.rows[0].status, 'succeeded');
      assert.equal(saved.rows[0].execution, execution ?? 'unconfirmed');
      assert.equal(Number(saved.rows[0].posts_fetched), 0);
      assert.equal(
        Number(saved.rows[0].cost_micros),
        xDiscoveryCost(emptyUsage, price),
      );
      // Reconciliation after restart cannot rewrite completed evidence or spend.
      await assert.rejects(
        restarted.settle(id, emptyUsage, price, [], 'completed'),
      );
    }
    const historical = await ledger.reserve(
      'grok-4.3',
      'historical-fixture',
      100000,
    );
    assert.ok(historical);
    ids.push(historical);
    // Pre-migration records deliberately retain unknown execution.
    await db.query(
      "UPDATE x_discovery_calls SET status='succeeded', cost_micros=0 WHERE id=$1",
      [historical],
    );
    const saved = await restartedDb.query(
      'SELECT execution FROM x_discovery_calls WHERE id=$1',
      [historical],
    );
    assert.equal(saved.rows[0].execution, null);
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      ids,
    ]);
    await db.end();
    await restartedDb.end();
  }
});

void test('fixed retry admission survives restart, keeps holds and rejects completed or historical searches', async () => {
  const db = database();
  const restartedDb = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const restarted = new PostgresXDiscoveryLedger(restartedDb);
  const day = new Date().toISOString().slice(0, 10);
  const {
    rows: [topic],
  } = await db.query<{ id: string; name: string }>(
    'SELECT id,name FROM topics WHERE enabled AND post_budget > 0 ORDER BY position LIMIT 1',
  );
  const empty = {
    inputTokens: 1,
    outputTokens: 1,
    postsFetched: 0,
    profilesFetched: 0,
  };
  try {
    for (const outcome of [
      'pending',
      'uncertain',
      'rejected',
      'completed',
      'unconfirmed',
      'historical',
      'fetched',
      'cited',
    ] as const) {
      const ids: string[] = [];
      const reserve = async (
        instance: PostgresXDiscoveryLedger,
        parent?: string,
        run = 'retry-fixture',
      ) => {
        const id = await instance.reserve(
          'grok-4.3',
          run,
          100000,
          topic,
          day,
          'fixed-trending',
          parent,
        );
        if (id) ids.push(id);
        return id;
      };
      try {
        const parent = await reserve(ledger);
        assert.ok(parent);
        if (outcome === 'uncertain' || outcome === 'rejected')
          await ledger.fail(parent, outcome);
        else if (outcome !== 'pending') {
          await ledger.settle(
            parent,
            { ...empty, postsFetched: outcome === 'fetched' ? 1 : 0 },
            price,
            [],
            outcome === 'completed' ? 'completed' : 'unconfirmed',
          );
          if (outcome === 'historical')
            await db.query(
              'UPDATE x_discovery_calls SET execution=NULL WHERE id=$1',
              [parent],
            );
          if (outcome === 'cited')
            await new PostgresXSearchRepository(db).save(topic.id, parent, [
              {
                externalId: '288099',
                url: 'https://x.com/example/status/288099',
              },
            ]);
        }
        assert.equal(await reserve(restarted, parent, 'wrong-run'), null);
        if (outcome === 'uncertain') {
          const hold = await ledger.reserve(
            'grok-4.3',
            'retry-budget-fixture',
            200001,
          );
          assert.ok(hold);
          ids.push(hold);
          assert.equal(await reserve(restarted, parent), null);
          await ledger.fail(hold, 'rejected');
        }
        const attempts = await Promise.all([
          reserve(ledger, parent),
          reserve(restarted, parent),
        ]);
        const admitted = attempts.filter((id): id is string => id !== null);
        const eligible = outcome === 'uncertain' || outcome === 'unconfirmed';
        assert.equal(admitted.length, eligible ? 1 : 0, outcome);
        if (eligible) {
          const child = admitted[0];
          assert.equal(await reserve(restarted, parent), null);
          await restarted.fail(child, 'uncertain');
          assert.equal(await reserve(ledger, child), null);
          assert.equal(await reserve(ledger, parent), null);
          if (outcome === 'uncertain')
            assert.equal((await restarted.status()).reservedMicros, 200000);
        }
      } finally {
        await db.query(
          'DELETE FROM x_search_citations WHERE call_id=ANY($1::uuid[])',
          [ids],
        );
        await db.query(
          'DELETE FROM x_discovery_calls WHERE optional_parent_id=ANY($1::uuid[])',
          [ids],
        );
        await db.query(
          'DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])',
          [ids],
        );
      }
    }
  } finally {
    await db.end();
    await restartedDb.end();
  }
});
