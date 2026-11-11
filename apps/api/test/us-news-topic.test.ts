import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';

void test('U.S. migration preserves World identity, seeds domestic sources and enables scheduled discovery', async () => {
  const db = database();
  try {
    const { rows } = await db.query(
      `SELECT id,name,position,story_budget,post_budget,enabled,relevance_policy,bluesky_query FROM topics WHERE id IN ('00000000-0000-4000-8000-000000000014','00000000-0000-4000-8000-000000000015') ORDER BY position`,
    );
    assert.equal(rows.length, 2);
    assert.equal(rows[0].name, 'World news & politics');
    assert.equal(rows[1].name, 'U.S. news & politics');
    assert.equal(rows[1].position, rows[0].position + 1);
    assert.equal(rows[1].story_budget, 5);
    assert.equal(rows[1].post_budget, 5);
    assert.equal(rows[1].enabled, true);
    assert.deepEqual(rows[1].relevance_policy, rows[0].relevance_policy);
    assert.deepEqual(rows[1].relevance_policy.includeAny, []);
    assert.ok(rows[1].bluesky_query);
    const connections = await db.query(
      `SELECT source_id FROM topic_source_connections WHERE topic_id=$1 ORDER BY source_id`,
      [rows[1].id],
    );
    assert.deepEqual(
      connections.rows.map((row) => row.source_id),
      ['guardian-us', 'npr-politics', 'pbs-politics'],
    );
    const old = await db.query(
      `SELECT source_id FROM topic_source_connections WHERE topic_id=$1 AND source_id='guardian-us'`,
      [rows[0].id],
    );
    assert.equal(old.rowCount, 0);
    const settings = await db.query(
      `SELECT reaction_min_faves,trending_min_faves FROM x_search_topic_settings WHERE topic_id=$1`,
      [rows[1].id],
    );
    assert.deepEqual(settings.rows, [
      { reaction_min_faves: 200, trending_min_faves: 2000 },
    ]);
    const scheduled = await new PostgresXSearchRepository(db).scheduledTopics(
      new Date(),
    );
    assert.ok(
      scheduled.some(
        (topic) => topic.id === rows[1].id && topic.handles.includes('AP'),
      ),
    );
  } finally {
    await db.end();
  }
});
