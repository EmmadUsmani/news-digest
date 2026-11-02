import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
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
