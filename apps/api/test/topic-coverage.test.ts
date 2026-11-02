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

void test('topic coverage unions discovery routes, isolates topics and pins health/window boundaries in a non-UTC session', async () => {
  const db = database();
  const client = await db.connect();
  const topic = crypto.randomUUID();
  const other = crypto.randomUUID();
  const call = crypto.randomUUID();
  const end = new Date('2033-03-02T12:00:00Z');
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    for (const id of [topic, other])
      await client.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
         VALUES($1,'00000000-0000-4000-8000-000000000001','Coverage fixture','','',-1)`,
        [id],
      );
    const empty = (await readTopicCoverage(client, end)).topics;
    assert.deepEqual(
      empty.slice(0, 2).map((row) => row.topicId),
      [topic, other].sort(),
    );
    assert.deepEqual(
      empty
        .filter((row) => [topic, other].includes(row.topicId))
        .map((row) => [
          row.connectedSources,
          row.healthySources,
          row.articles,
          row.xPosts,
          row.redditPosts,
        ]),
      [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    );
    for (const [index, at] of [
      '2033-03-02T11:00:00Z',
      '2033-03-02T12:00:00Z',
      '2033-03-02T10:59:59.999Z',
      '2033-03-02T12:00:00.001Z',
      null,
    ].entries()) {
      await client.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url,last_success)
         VALUES($1,$2,'Fixture','feed',$3,$4)`,
        [
          `coverage-health-${index}`,
          topic,
          `https://example.com/health-${index}`,
          at,
        ],
      );
      await client.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topic, `coverage-health-${index}`],
      );
    }
    await client.query(
      `INSERT INTO social_discovery_sources(id,topic_id,name,url)
      VALUES('coverage-river',$1,'Fixture','https://example.com/coverage-river')`,
      [topic],
    );
    await client.query(
      `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros)
      VALUES($1,'fixture','coverage','failed',1)`,
      [call],
    );
    // Citation age and call outcome do not change the verified publication window.
    for (const [id, at] of [
      ['779901', '2033-03-01T04:00:00-08:00'],
      ['779902', '2033-03-02T11:59:59.999Z'],
      ['779903', '2033-03-02T12:00:00Z'],
      ['779904', '2033-03-01T11:59:59.999Z'],
      ['779905', null],
    ]) {
      await client.query(
        `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html)
        VALUES('x',$1,'https://x.com/a/status/' || $1,'a','https://x.com/a',$2,'fixture')`,
        [id, at],
      );
      await client.query(
        `INSERT INTO social_discovery_citations(source_id,external_id,canonical_url)
        VALUES('coverage-river',$1,'https://x.com/a/status/' || $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url)
        VALUES($1,$2,$3,'https://x.com/a/status/' || $3)`,
        [call, topic, id],
      );
    }
    await client.query(`INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,embed_html,reddit_metadata)
      VALUES('reddit','coveragebridge','https://www.reddit.com/r/nba/comments/coveragebridge/','a','https://www.reddit.com/user/a/','2033-03-02T11:00:00Z','','{}')`);
    await client.query(
      `INSERT INTO reddit_topic_posts(topic_id,external_id) VALUES($1,'coveragebridge')`,
      [topic],
    );
    await client.query(`INSERT INTO reddit_x_citations(reddit_id,external_id,canonical_url)
      VALUES('coveragebridge','779901','https://x.com/a/status/779901')`);
    let coverage = await readTopicCoverage(client, end);
    assert.equal(coverage.end, end.toISOString());
    const row = coverage.topics.find((row) => row.topicId === topic)!;
    assert.deepEqual(
      [
        row.connectedSources,
        row.healthySources,
        row.articles,
        row.xPosts,
        row.redditPosts,
      ],
      [5, 2, 0, 2, 1],
    );
    assert.equal(
      coverage.topics.find((row) => row.topicId === other)!.xPosts,
      0,
    );
    await client.query(
      "UPDATE content_sources SET last_error='fixture failure' WHERE id='coverage-health-0'",
    );
    // Reassign the river: search/Reddit evidence preserves the original topic's posts.
    await client.query(
      "UPDATE social_discovery_sources SET topic_id=$1 WHERE id='coverage-river'",
      [other],
    );
    coverage = await readTopicCoverage(client, end);
    assert.equal(
      coverage.topics.find((row) => row.topicId === topic)!.healthySources,
      1,
    );
    assert.equal(
      coverage.topics.find((row) => row.topicId === topic)!.xPosts,
      2,
    );
    assert.equal(
      coverage.topics.find((row) => row.topicId === other)!.xPosts,
      2,
    );
    await client.query('DELETE FROM topics WHERE id=$1', [topic]);
    coverage = await readTopicCoverage(client, end);
    assert.equal(
      coverage.topics.some((row) => row.topicId === topic),
      false,
    );
    assert.equal(
      coverage.topics.find((row) => row.topicId === other)!.xPosts,
      2,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});
