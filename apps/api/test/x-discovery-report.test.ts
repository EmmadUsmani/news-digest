import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { readXDiscoveryReport } from '../src/modules/social/database/x-discovery-report';

void test('X daily evidence preserves zero-yield calls, counts cost once and uses UTC boundaries', async () => {
  const db = database();
  const client = await db.connect();
  const topic = '00000000-0000-4000-8000-000000000011';
  const ids = [1, 2, 3, 4, 5].map(
    (n) => `11223344-0000-4000-8000-00000000000${n}`,
  );
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    for (const [index, id] of ids.entries()) {
      const status =
        index === 2 ? 'uncertain' : index === 3 ? 'failed' : 'succeeded';
      const at =
        index === 4 ? '2032-01-03T00:00:00Z' : `2032-01-02T0${index}:00:00Z`;
      await client.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,cost_micros,created_at)
        VALUES($1,'fixture','fixture-report',$2,400000,$3,$4)`,
        [id, status, status === 'succeeded' ? 25000 : null, at],
      );
    }
    for (const externalId of ['887711', '887712', '887713'])
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
        VALUES($1,$2,$3,'https://x.com/a/status/' || $3)`,
        [ids[0], topic, externalId],
      );
    await client.query(`INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html) VALUES
      ('x','887711','https://x.com/a/status/887711','a','https://x.com/a','2032-01-01T12:00:00Z','fixture'),
      ('x','887712','https://x.com/a/status/887712','a','https://x.com/a',NULL,'fixture')`);
    const report = await readXDiscoveryReport(client, '2032-01-02');
    assert.equal(report.calls.length, 4);
    assert.equal(report.costMicros, 50000);
    assert.equal(report.heldMicros, 400000);
    assert.deepEqual(report.calls[0].topics, [
      {
        topicId: topic,
        name: 'Tech & AI',
        citations: 3,
        verifiedNow: 2,
        datedNow: 1,
      },
    ]);
    assert.deepEqual(report.calls[1].topics, []);
    assert.equal(report.calls[1].requestedTopic, null);
    assert.equal(report.calls[3].heldMicros, 0);
    assert.equal(
      (await readXDiscoveryReport(client, '2032-01-04')).calls.length,
      0,
    );
    for (const day of ['2032-02-30', '2032-1-02', 'garbage'])
      await assert.rejects(readXDiscoveryReport(client, day), /valid UTC date/);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});

void test('X reservation snapshots attribute failed and zero-yield calls after topic deletion', async () => {
  const db = database();
  const ledger = new PostgresXDiscoveryLedger(db);
  const topicId = crypto.randomUUID();
  const runId = crypto.randomUUID();
  const calls: string[] = [];
  try {
    await db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      VALUES($1,'00000000-0000-4000-8000-000000000001','Original topic','Fixture','Fixture',100)`,
      [topicId],
    );
    const snapshot = { id: topicId, name: 'Original topic' };
    const failed = await ledger.reserve('fixture', runId, 400000, snapshot);
    assert.ok(failed);
    calls.push(failed);
    await ledger.fail(failed, 'rejected');
    const empty = await ledger.reserve('fixture', runId, 400000, snapshot);
    assert.ok(empty);
    calls.push(empty);
    await ledger.settle(
      empty,
      { inputTokens: 0, outputTokens: 0, postsFetched: 0, profilesFetched: 0 },
      {
        inputPerMillion: 1.25,
        outputPerMillion: 2.5,
        perPost: 0.005,
        perProfile: 0.01,
      },
    );
    await db.query("UPDATE topics SET name='Renamed' WHERE id=$1", [topicId]);
    await db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    // Pin the report date independently of the clock or UTC midnight.
    await db.query(
      "UPDATE x_discovery_calls SET created_at='2033-02-01T12:00:00Z' WHERE run_id=$1",
      [runId],
    );
    const report = await readXDiscoveryReport(db, '2033-02-01');
    assert.equal(report.calls.length, 2);
    for (const call of report.calls) {
      assert.deepEqual(call.requestedTopic, snapshot);
      assert.deepEqual(call.topics, []);
    }
    assert.deepEqual(
      new Set(report.calls.map((c) => c.status)),
      new Set(['failed', 'succeeded']),
    );
  } finally {
    await db.query('DELETE FROM x_discovery_calls WHERE id=ANY($1::uuid[])', [
      calls,
    ]);
    await db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await db.end();
  }
});
