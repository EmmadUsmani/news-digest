import 'reflect-metadata';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { NestFactory } from '@nestjs/core';
import { Pool } from 'pg';

import { PublicArticlesReader } from '../src/modules/ingestion/database/public-articles.reader';
import { PublicSourceHealthReader } from '../src/modules/ingestion/database/public-source-health.reader';
import { PublicScheduleReader } from '../src/modules/profiles/database/public-schedule.reader';
import { PublicSourcesReader } from '../src/modules/topics/database/public-sources.reader';
import { PublicTopicsReader } from '../src/modules/topics/database/public-topics.reader';
import { PublicReadModule } from '../src/public-read/public-read.module';
import { readPublicSourceCatalog } from '../src/public-read/settings';
import { readPublicSourceHealth } from '../src/public-read/source-health';

void test('composed public reads share storage, preserve projections and isolate route failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  let opened = 0;
  const app = await NestFactory.create(
    PublicReadModule.prepare(
      { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1', READER_PUBLISHED_ONLY: '1' },
      () => {
        opened++;
        return pool;
      },
    ),
    { logger: false },
  );
  try {
    await pool.query('BEGIN');
    await pool.query('ALTER TABLE profiles RENAME TO private_owner_fixture');
    await pool.query(
      "UPDATE content_sources SET url = 'https://publisher.org/private-marker?token=private-marker#private-marker', last_error = 'private-marker'",
    );
    const topic = (
      await pool.query(
        'SELECT id FROM topics WHERE enabled = true ORDER BY position, id LIMIT 1',
      )
    ).rows[0].id as string;
    const source = (
      await pool.query(
        'SELECT source_id FROM topic_source_connections WHERE topic_id = $1 LIMIT 1',
        [topic],
      )
    ).rows[0].source_id as string;
    const article = randomUUID();
    await pool.query(
      `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at) VALUES($1,'https://publisher.org/private-marker?token=private-marker#private-marker','Public fixture title','private-marker','2035-01-01T00:00:00Z')`,
      [article],
    );
    await pool.query(
      'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
      [article, source],
    );
    await pool.query(
      "ALTER TABLE content_items ADD COLUMN private_future_column text DEFAULT 'private-marker'",
    );
    const articles = await new PublicArticlesReader(pool).read();
    const item = articles
      .find((row) => row.topicId === topic)
      ?.items.find((row) => row.id === article);
    assert.ok(item);
    assert.equal(item.publisherOrigin, 'https://publisher.org');
    assert.equal(item.title, 'Public fixture title');
    const health = await readPublicSourceHealth(() =>
      new PublicSourceHealthReader(pool).read(),
    );
    const expected = new Map<string, unknown>([
      ['/api/settings/schedule', await new PublicScheduleReader(pool).read()],
      ['/api/admin/topics', await new PublicTopicsReader(pool).read()],
      [
        '/api/admin/topics/sources',
        await readPublicSourceCatalog(() =>
          new PublicSourcesReader(pool).read(),
        ),
      ],
      ['/api/admin/content/sources', health],
      ['/api/admin/content', articles],
    ]);
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo;
    const base = `http://127.0.0.1:${address.port}`;
    for (const [path, value] of expected) {
      const get = await fetch(base + path);
      assert.equal(get.status, 200);
      assert.equal(get.headers.get('cache-control'), 'no-store');
      const body = await get.text();
      assert.equal(body.includes('private-marker'), false);
      assert.deepEqual(JSON.parse(body), value);
      const head = await fetch(base + path, { method: 'HEAD' });
      assert.equal(head.status, 200);
      assert.equal(await head.text(), '');
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'])
        assert.equal((await fetch(base + path, { method })).status, 404);
    }
    assert.equal(opened, 1);
    // No legacy endpoints or unaudited content/status routes leak into composition.
    for (const path of [
      '/api/admin/profile',
      '/api/admin/content/window',
      '/api/admin/status',
    ])
      assert.equal((await fetch(base + path)).status, 404);
    await pool.query('DELETE FROM edition_settings');
    const failure = await fetch(base + '/api/settings/schedule');
    assert.equal(failure.status, 503);
    assert.deepEqual(await failure.json(), {
      message: 'Schedule settings unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
    assert.equal((await fetch(base + '/api/admin/topics')).status, 200);
    assert.equal(
      (await fetch(base + '/api/admin/content/sources')).status,
      200,
    );
    // A broken article column fails generically without breaking sibling routes.
    await pool.query(
      'ALTER TABLE content_items RENAME COLUMN title TO private_title',
    );
    const articleFailure = await fetch(base + '/api/admin/content');
    assert.equal(articleFailure.status, 503);
    assert.deepEqual(await articleFailure.json(), {
      message: 'Articles unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
    assert.equal((await fetch(base + '/api/admin/topics')).status, 200);
    assert.equal(
      (await fetch(base + '/api/admin/content/sources')).status,
      200,
    );
    await app.close();
    assert.equal((await pool.query('SELECT 1 AS alive')).rows[0].alive, 1);
  } finally {
    await app.close();
    await pool.query('ROLLBACK');
    await pool.end();
  }
});
