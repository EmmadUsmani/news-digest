import assert from 'node:assert/strict';
import test from 'node:test';

import { Pool } from 'pg';

import { inventoryArticleLinks } from '../../../scripts/lib/article-link-inventory';

void test('article inventory scans every cursor page without changing rows and recovers after query failure', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    // Temporary shadow table is visible only on this connection; no fixture
    // catalog or production table is changed by either success or failure.
    await pool.query(
      'CREATE TEMP TABLE content_items (id int PRIMARY KEY, canonical_url text)',
    );
    await pool.query(
      `INSERT INTO content_items SELECT n, 'https://publisher.com/story/' || n FROM generate_series(1, 1001) n`,
    );
    await pool.query(
      `INSERT INTO content_items VALUES (1002, 'https://user:private-token@publisher.com/?token=private-token'), (1003, 'not a URL private-token')`,
    );
    const fingerprint = () =>
      pool.query(
        'SELECT md5(string_agg(canonical_url, chr(10) ORDER BY id)) AS fingerprint FROM content_items',
      );
    const before = (await fingerprint()).rows;
    assert.deepEqual(await inventoryArticleLinks(pool), {
      total: 1003,
      malformed: 1,
      publicHttps: 1001,
      rejectedByPublicUrlPolicy: 1,
      credentials: 1,
      query: 1,
      fragment: 0,
    });
    assert.deepEqual((await fingerprint()).rows, before);
    await pool.query(
      'ALTER TABLE content_items RENAME COLUMN canonical_url TO unavailable_url',
    );
    await assert.rejects(inventoryArticleLinks(pool));
    // A returned connection must not retain the aborted transaction.
    await pool.query(
      'ALTER TABLE content_items RENAME COLUMN unavailable_url TO canonical_url',
    );
    assert.deepEqual((await fingerprint()).rows, before);
    assert.equal((await inventoryArticleLinks(pool)).total, 1003);
  } finally {
    await pool.end();
  }
});
