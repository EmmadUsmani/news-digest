import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';
import { NestFactory } from '@nestjs/core';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';

const require = createRequire(import.meta.url);
const { AppModule } = require('../dist/app.js') as typeof import('../src/app');

void test('published reader filters before pagination and ID lookup while admin retains private editions', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresPreviewRepository();
  const insertedIds: string[] = [];
  const previous = process.env.READER_PUBLISHED_ONLY;
  const previousOwnership = process.env.SYSTEM_OWNERSHIP;
  delete process.env.SYSTEM_OWNERSHIP;
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const base = `${await app.getUrl()}/api/editions`;
    const published: DigestPreview[] = [];
    const hidden: DigestPreview[] = [];
    const profile = '00000000-0000-4000-8000-000000000001';
    for (let index = 0; index < 27; index++) {
      const visible = index < 23;
      const snapshot: DigestPreview = {
        id: randomUUID(),
        createdAt: '9998-01-02T00:00:00.000Z',
        windowStart: '9998-01-01T00:00:00.000Z',
        windowEnd: '9998-01-02T00:00:00.000Z',
        method: 'signals-v6',
        topics: [],
      };
      // Newer private rows must not displace latest or consume history slots.
      const createdAt = visible ? snapshot.createdAt : '9999-01-02T00:00:00Z';
      const kind = visible
        ? index === 0
          ? 'manual'
          : 'scheduled'
        : index % 2
          ? 'test'
          : 'manual';
      await repository.db.query(
        'INSERT INTO digest_previews(id,profile_id,created_at,window_start,window_end,snapshot,kind,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          snapshot.id,
          profile,
          createdAt,
          snapshot.windowStart,
          snapshot.windowEnd,
          snapshot,
          kind,
          visible ? snapshot.createdAt : null,
        ],
      );
      insertedIds.push(snapshot.id);
      (visible ? published : hidden).push(snapshot);
    }
    published.sort((a, b) => b.id.localeCompare(a.id));
    const get = async (path: string) => {
      const response = await fetch(base + path);
      assert.equal(response.status, 200);
      return response.json();
    };
    process.env.READER_PUBLISHED_ONLY = '1';
    assert.equal((await get('/latest')).id, published[0].id);
    const first = await get('');
    assert.deepEqual(
      first.entries.map((row: { id: string }) => row.id),
      published.slice(0, 20).map((row) => row.id),
    );
    assert.equal(first.hasMore, true);
    const second = await get('?offset=20');
    // Existing fixture editions may follow these synthetic 9998 records.
    assert.deepEqual(
      second.entries.slice(0, 3).map((row: { id: string }) => row.id),
      published.slice(20).map((row) => row.id),
    );
    for (const snapshot of published) {
      assert.equal((await get(`/${snapshot.id}`)).id, snapshot.id);
    }
    for (const snapshot of hidden) {
      assert.equal((await fetch(`${base}/${snapshot.id}`)).status, 404);
      assert.deepEqual(await repository.find(snapshot.id), snapshot);
    }
    // Compare complete HTTP bodies for every original owner edition, including
    // private 404s, and original history entries across all pages. Foreign-owned
    // fixtures intentionally join system history; do not mistake expansion for drift. This is isolated fixture acceptance only;
    // restored production response preservation remains a separate rollout gate.
    const stored = await repository.db.query<{ id: string }>(
      'SELECT id FROM digest_previews WHERE profile_id=$1 ORDER BY id',
      [profile],
    );
    const originalIds = new Set(stored.rows.map((row) => row.id));
    const total = await repository.db.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM digest_previews',
    );
    const capture = async () => {
      const responses: { path: string; status: number; body: unknown }[] = [];
      const record = async (path: string) => {
        const response = await fetch(base + path);
        const body = await response.json();
        // Nest's 404 body contains stable status/message/path, no request time.
        responses.push({ path, status: response.status, body });
        return body;
      };
      await record('/latest');
      let offset = 0;
      const history: unknown[] = [];
      for (;;) {
        const response = await fetch(`${base}?offset=${offset}`);
        assert.equal(response.status, 200);
        const page = await response.json();
        assert.ok(Array.isArray(page.entries));
        history.push(
          ...page.entries.filter((entry: { id: string }) =>
            originalIds.has(entry.id),
          ),
        );
        if (!page.hasMore) break;
        assert.ok(page.entries.length > 0, 'history pagination must advance');
        offset += page.entries.length;
        assert.ok(offset <= total.rows[0].count, 'history must terminate');
      }
      responses.push({
        path: 'complete-original-history',
        status: 200,
        body: history,
      });
      for (const row of stored.rows) await record(`/${row.id}`);
      return responses;
    };
    for (const publishedOnly of ['1', '0']) {
      process.env.READER_PUBLISHED_ONLY = publishedOnly;
      delete process.env.SYSTEM_OWNERSHIP;
      const original = await capture();
      process.env.SYSTEM_OWNERSHIP = '1';
      assert.deepEqual(
        await capture(),
        original,
        'system scope preserves full HTTP responses',
      );
      delete process.env.SYSTEM_OWNERSHIP;
      assert.deepEqual(
        await capture(),
        original,
        'flag rollback preserves full HTTP responses',
      );
    }
    delete process.env.READER_PUBLISHED_ONLY;
    const adminLatest = await repository.latest();
    assert.ok(hidden.some((snapshot) => snapshot.id === adminLatest?.id));
    const unfiltered = await get('/latest');
    assert.ok(hidden.some((snapshot) => snapshot.id === unfiltered.id));
    assert.equal((await get(`/${hidden[0].id}`)).id, hidden[0].id);
    process.env.READER_PUBLISHED_ONLY = 'true';
    assert.equal((await get(`/${hidden[0].id}`)).id, hidden[0].id);
  } finally {
    if (previous === undefined) delete process.env.READER_PUBLISHED_ONLY;
    else process.env.READER_PUBLISHED_ONLY = previous;
    if (previousOwnership === undefined) delete process.env.SYSTEM_OWNERSHIP;
    else process.env.SYSTEM_OWNERSHIP = previousOwnership;
    await app.close();
    // The next test file sees exactly the original migrated schema and rows.
    await repository.db.query(
      'ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview',
    );
    await repository.db.query(
      'DELETE FROM digest_previews WHERE id = ANY($1::uuid[])',
      [insertedIds],
    );
    await repository.db.query(`
      ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview;


    `);
    await repository.onModuleDestroy();
  }
});
