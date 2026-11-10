import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';

void test('prepared Grafana reader exposes only published counts and bounded source health', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO digest_previews
      (profile_id,window_start,window_end,snapshot,kind,published_at)
      VALUES (NULL,now() - interval '1 day',now(),'{"secret":"private-snapshot-marker"}','manual',NULL),
      (NULL,now() - interval '1 day',now(),'{"secret":"published-snapshot-marker"}','scheduled','2099-11-10T15:00:00Z')`);
    await client.query(`INSERT INTO content_sources(id,name,kind,url,last_error)
      VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff','private-source-marker','feed',
      'https://example.test/private-url-marker','raw-error-marker')`);
    await client.query(`INSERT INTO digest_previews
      (profile_id,window_start,window_end,snapshot,kind,published_at)
      VALUES (NULL,now()-interval '1 day',now(),
      '{"topics":[{"name":"private-topic-marker","stories":[1,2,3],"posts":[1,2]}]}','manual',NULL),
      (NULL,now()-interval '1 day',now(),
      '{"topics":[{"name":"public-topic-marker","stories":[{"text":"story-marker"}],"posts":[1,2]},{"stories":null,"posts":"bad-shape-marker"}]}',
      'scheduled','2099-11-11T15:00:00Z'),
      (NULL,now()-interval '1 day',now(),'{"topics":null}',
      'scheduled','2099-11-12T15:00:00Z')`);
    const sql = readFileSync(
      'ops/observability/grafana/sql/public-product-reader.sql',
      'utf8',
    );
    await client.query(sql);
    await client.query(sql); // Rehearse an idempotent deployment.
    await client.query('SET LOCAL ROLE grafana_public_product');
    const editions = await client.query(
      "SELECT * FROM grafana_public.published_editions WHERE day_utc = '2099-11-10'",
    );
    assert.deepEqual(editions.rows, [
      { day_utc: new Date('2099-11-10T00:00:00Z'), editions: '1' },
    ]);
    const content = await client.query(
      "SELECT * FROM grafana_public.published_content WHERE day_utc >= '2099-11-11' ORDER BY day_utc",
    );
    assert.deepEqual(content.rows, [
      {
        day_utc: new Date('2099-11-11T00:00:00Z'),
        topics: '2',
        stories: '1',
        posts: '2',
      },
      {
        day_utc: new Date('2099-11-12T00:00:00Z'),
        topics: '0',
        stories: '0',
        posts: '0',
      },
    ]);
    assert.doesNotMatch(JSON.stringify(content.rows), /marker/);
    assert.equal(
      (
        await client.query(
          'SELECT * FROM grafana_public.published_content WHERE day_utc IS NULL',
        )
      ).rowCount,
      0,
    );
    const health = await client.query(
      'SELECT * FROM grafana_public.source_health',
    );
    assert.deepEqual(
      health.fields.map((field) => field.name),
      [
        'id',
        'enabled',
        'last_success',
        'last_attempt',
        'last_item_count',
        'has_error',
      ],
    );
    assert.equal(
      health.rows.find(
        (row) => row.id === 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      ).has_error,
      true,
    );
    assert.doesNotMatch(JSON.stringify([editions.rows, health.rows]), /marker/);
    for (const query of [
      'SELECT snapshot FROM public.digest_previews',
      'SELECT last_error FROM public.content_sources',
      'SELECT email FROM public.users',
      'SELECT token_hash FROM public.sessions',
      'SET ROLE grafana_product',
      'DELETE FROM grafana_public.source_health',
      'CREATE TABLE grafana_public.injection(id int)',
    ]) {
      await client.query('SAVEPOINT denied');
      await assert.rejects(
        client.query(query),
        /permission denied|does not exist/,
      );
      await client.query('ROLLBACK TO SAVEPOINT denied');
    }
    const grants =
      await client.query(`SELECT table_schema,table_name FROM information_schema.role_table_grants
      WHERE grantee = current_user AND table_schema NOT IN ('pg_catalog','information_schema')
      ORDER BY table_name`);
    assert.deepEqual(grants.rows, [
      { table_schema: 'grafana_public', table_name: 'published_content' },
      { table_schema: 'grafana_public', table_name: 'published_editions' },
      { table_schema: 'grafana_public', table_name: 'source_health' },
    ]);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
