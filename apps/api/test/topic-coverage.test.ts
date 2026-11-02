import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { readTopicCoverage } from '../src/modules/operations/database/topic-coverage';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';

void test('topic coverage deduplicates collection scope, excludes unverified/undated posts and respects publication boundaries', async () => {
  const db = database();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const topic = '00000000-0000-4000-8000-000000000011';
    const end = new Date('2030-02-02T12:00:00Z');
    await client.query(`UPDATE topics SET enabled=false WHERE id=$1`, [topic]);
    await client.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url,last_success) VALUES
      ('coverage-a',$1,'Coverage A','feed','https://example.com/a','2030-02-02T11:30:00Z'),
      ('coverage-b',$1,'Coverage B','feed','https://example.com/b','2030-02-02T10:30:00Z'),
      ('coverage-c',$1,'Coverage C','feed','https://example.com/c','2030-02-02T11:30:00Z')`,
      [topic],
    );
    await client.query(
      "UPDATE content_sources SET last_error='failure' WHERE id='coverage-c'",
    );
    await client.query(
      `INSERT INTO topic_source_connections(topic_id,source_id)
      SELECT $1,id FROM content_sources WHERE id LIKE 'coverage-%'`,
      [topic],
    );
    await client.query(`INSERT INTO content_items(canonical_url,title,excerpt,published_at) VALUES
      ('https://example.com/coverage-start','Start','','2030-02-01T12:00:00Z'),
      ('https://example.com/coverage-end','End','','2030-02-02T12:00:00Z'),
      ('https://example.com/coverage-old','Old','','2030-02-01T11:59:59Z')`);
    await client.query(`INSERT INTO content_observations(source_id,item_id)
      SELECT s.id,i.id FROM content_sources s CROSS JOIN content_items i
      WHERE s.id IN ('coverage-a','coverage-b') AND i.canonical_url LIKE 'https://example.com/coverage-%'`);
    await client.query(`INSERT INTO x_link_citations(external_id,canonical_url,source_id,item_id)
      SELECT post.id,'https://x.com/a/status/' || post.id,s.id,i.id FROM
      unnest(ARRAY['998811','998812','998813']) post(id) CROSS JOIN content_sources s CROSS JOIN content_items i
      WHERE s.id IN ('coverage-a','coverage-b') AND i.canonical_url='https://example.com/coverage-start'`);
    await client.query(`INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html) VALUES
      ('x','998811','https://x.com/a/status/998811','a','https://x.com/a','2030-02-01T12:00:00Z','verified fixture'),
      ('x','998812','https://x.com/a/status/998812','a','https://x.com/a',NULL,'verified fixture')`);
    await client.query(`INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html,reddit_metadata)
      VALUES('reddit','998811','https://www.reddit.com/r/nba/comments/998811/','a','https://www.reddit.com/user/a/','2030-02-02T11:00:00Z','','{}')`);
    await client.query(
      `INSERT INTO reddit_topic_posts(topic_id,external_id) VALUES($1,'998811')`,
      [topic],
    );
    const result = await readTopicCoverage(client, end);
    const row = result.topics.find((row) => row.topicId === topic)!;
    assert.equal(result.start, '2030-02-01T12:00:00.000Z');
    assert.equal(row.enabled, false);
    assert.equal(row.articles, 1);
    assert.equal(row.xPosts, 1);
    assert.equal(row.redditPosts, 1);
    assert.equal(row.healthySources, 1);
    assert.ok(row.connectedSources >= 3);
    assert.equal(result.topics.length, 4);
    const searches = new PostgresXSearchRepository(client as never);
    assert.equal(
      (await searches.scheduledTopics(end)).some((row) => row.id === topic),
      false,
    );
    await client.query(
      'UPDATE topics SET enabled=true,post_budget=5 WHERE id=$1',
      [topic],
    );
    assert.equal(
      (await searches.scheduledTopics(end)).find((row) => row.id === topic)
        ?.freePosts,
      1,
    );
    await client.query('UPDATE topics SET post_budget=0 WHERE id=$1', [topic]);
    assert.equal(
      (await searches.scheduledTopics(end)).some((row) => row.id === topic),
      false,
    );

    assert.equal(result.topics.find((row) => row.name === 'NBA')?.articles, 0);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
