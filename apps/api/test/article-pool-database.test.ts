import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { loadIncrementalTriagePool } from '../src/modules/digests/public/incremental-triage-pool';
import { loadReactionStories } from '../src/modules/digests/public/reaction-stories';

void test('article pool readers honor independent budgets, transaction configuration and exact windows in PostgreSQL', async () => {
  const db = database();
  const client = await db.connect();
  const topic = '00000000-0000-4000-8000-000000000011';
  const start = new Date('2030-02-01T12:00:00Z');
  const end = new Date('2030-02-02T12:00:00Z');
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    await client.query(
      `UPDATE topics SET enabled=true,story_budget=5,post_budget=5,
       include_guidance='Include launches',exclude_guidance='Skip rumors',
       relevance_policy=$2 WHERE id=$1`,
      [topic, { includeAny: ['NBA'], excludeAny: ['rumor'] }],
    );
    await client.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [topic],
    );
    await client.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
       ('pool-db-a',$1,'Pool A','feed','https://example.org/pool-a'),
       ('pool-db-b',$1,'Pool B','feed','https://example.org/pool-b')`,
      [topic],
    );
    await client.query(
      `INSERT INTO topic_source_connections(topic_id,source_id)
       VALUES($1,'pool-db-a'),($1,'pool-db-b')`,
      [topic],
    );
    const rows = (
      await client.query<{ id: string; title: string }>(
        `INSERT INTO content_items(canonical_url,title,excerpt,published_at) VALUES
       ('https://example.org/pool-start','NBA team announces a new training facility','The facility opens today.','2030-02-01T04:00:00-08:00'),
       ('https://example.org/pool-semantic','Basketball team announces a new head coach','The coach starts today.','2030-02-02T11:00:00Z'),
       ('https://example.org/pool-excluded','NBA rumor about a possible trade','Unconfirmed speculation.','2030-02-02T10:00:00Z'),
       ('https://example.org/pool-end','NBA team signs a new player','A contract was signed.','2030-02-02T12:00:00Z'),
       ('https://example.org/pool-old','NBA team opens a new arena','The arena opened.','2030-02-01T11:59:59.999Z')
       RETURNING id,title`,
      )
    ).rows;
    await client.query(
      `INSERT INTO content_observations(source_id,item_id)
       SELECT s.id,i.id FROM content_sources s CROSS JOIN content_items i
       WHERE s.id IN ('pool-db-a','pool-db-b') AND i.id=ANY($1::uuid[])`,
      [rows.map((row) => row.id)],
    );
    const pool = await loadIncrementalTriagePool(client, topic, start, end);
    assert.deepEqual(
      pool?.candidates.map((item) => item.title),
      [rows[1].title, rows[0].title],
    );
    assert.deepEqual(pool?.candidates[0].sources, ['Pool A', 'Pool B']);
    assert.equal(pool?.candidates[1].publishedAt, start.toISOString());
    assert.equal(
      pool?.topic.guidance,
      'Include launches\nExclude: Skip rumors\nRequired phrases: NBA\nExcluded phrases: rumor',
    );
    const reactions = await loadReactionStories(client, topic, start, end);
    assert.deepEqual(
      reactions.map((item) => item.id),
      [rows[0].id],
    );
    await client.query('UPDATE topics SET story_budget=0 WHERE id=$1', [topic]);
    assert.equal(
      await loadIncrementalTriagePool(client, topic, start, end),
      null,
    );
    assert.deepEqual(
      await loadReactionStories(client, topic, start, end),
      reactions,
    );
    await client.query(
      'UPDATE topics SET story_budget=5,post_budget=0 WHERE id=$1',
      [topic],
    );
    assert.deepEqual(await loadReactionStories(client, topic, start, end), []);
    assert.deepEqual(
      await loadIncrementalTriagePool(client, topic, start, end),
      pool,
    );
    await client.query('UPDATE topics SET enabled=false WHERE id=$1', [topic]);
    assert.equal(
      await loadIncrementalTriagePool(client, topic, start, end),
      null,
    );
    assert.deepEqual(await loadReactionStories(client, topic, start, end), []);
    await client.query('DELETE FROM topics WHERE id=$1', [topic]);
    assert.equal(
      await loadIncrementalTriagePool(client, topic, start, end),
      null,
    );
    assert.deepEqual(await loadReactionStories(client, topic, start, end), []);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
