import 'reflect-metadata';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';

import { PublicArticlesReader } from '../src/modules/ingestion/database/public-articles.reader';

void test('system article reader bounds, orders and deduplicates explicit public fields without legacy ownership', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const reader = new PublicArticlesReader(pool);
  const topic = randomUUID();
  const empty = randomUUID();
  const disabled = randomUUID();
  const prefix = `public-${topic}`;
  const ids = Array.from({ length: 8 }, () => randomUUID()).sort();
  const previous = process.env.SYSTEM_OWNERSHIP;
  try {
    await pool.query('BEGIN');
    await pool.query('UPDATE topics SET enabled = false');
    for (const [id, enabled, position] of [
      [topic, true, 1],
      [empty, true, 2],
      [disabled, false, 0],
    ]) {
      await pool.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,enabled) VALUES($1,NULL,'Fixture','','',$2,$3)`,
        [id, position, enabled],
      );
    }
    for (const suffix of ['a', 'b']) {
      await pool.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,'feed','https://example.org/private-source')`,
        [`${prefix}-${suffix}`, topic, `Source ${suffix}`],
      );
      await pool.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topic, `${prefix}-${suffix}`],
      );
    }
    for (const [index, id] of ids.entries()) {
      await pool.query(
        `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at) VALUES($1,$2,$3,'private-excerpt',$4)`,
        [
          id,
          `https://example.org/${prefix}/${index === 7 ? 'betting/' : ''}${index}?secret=private-query`,
          `Title ${index}`,
          index === 7 ? '2036-01-01T00:00:00Z' : '2035-01-01T00:00:00Z',
        ],
      );
      for (const suffix of ['a', 'b'])
        await pool.query(
          'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
          [id, `${prefix}-${suffix}`],
        );
    }
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      "ALTER TABLE content_items ADD COLUMN private_future_column text DEFAULT 'private-marker'",
    );
    for (const flag of [undefined, '0', '1']) {
      if (flag === undefined) delete process.env.SYSTEM_OWNERSHIP;
      else process.env.SYSTEM_OWNERSHIP = flag;
      const result = await reader.read();
      assert.deepEqual(
        result.map((row) => row.topicId),
        [topic, empty],
      );
      assert.deepEqual(result[1].items, []);
      assert.deepEqual(
        result[0].items.map((row) => row.id),
        ids.slice(0, 5),
      );
      assert.equal(result[0].items.length, 5);
      for (const row of result[0].items) {
        assert.deepEqual(
          Object.keys(row).sort(),
          ['id', 'title', 'publisherOrigin', 'publishedAt', 'source'].sort(),
        );
        assert.equal(row.publisherOrigin, 'https://example.org');
        assert.equal(row.source, 'Source a');
        assert.equal(
          Date.parse(row.publishedAt),
          Date.parse('2035-01-01T00:00:00Z'),
        );
      }
      assert.doesNotMatch(JSON.stringify(result), /private-|secret=/);
    }
    await pool.query(
      'ALTER TABLE content_items RENAME COLUMN title TO private_title',
    );
    await assert.rejects(reader.read(), (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.equal(error.message, 'Articles unavailable');
      return true;
    });
  } finally {
    if (previous === undefined) delete process.env.SYSTEM_OWNERSHIP;
    else process.env.SYSTEM_OWNERSHIP = previous;
    await pool.query('ROLLBACK');
    assert.equal((await pool.query('SELECT 1 AS alive')).rows[0].alive, 1);
    await pool.end();
  }
});
