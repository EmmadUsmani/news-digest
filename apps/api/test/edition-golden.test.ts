import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { digestPreviewSchema } from '@digest/contracts';

import { PostgresPreviewRepository } from '../src/modules/digests/database/preview.repository';
import type { PreviewRepository } from '../src/modules/digests/domain/preview.repository';

const fixture = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`fixtures/editions/${name}.json`, import.meta.url),
      'utf8',
    ),
  );

void test('nonempty fallback edition matches the reviewed golden snapshot through publication and retrieval', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  assert.equal(process.env.ANTHROPIC_API_KEY, '');
  const adapter = new PostgresPreviewRepository();
  const repository: PreviewRepository = adapter;
  const topic = '00000000-0000-4000-8000-000000000879';
  const source = 'golden-science-publisher';
  const items = fixture('non-ai-input') as {
    id: string;
    title: string;
    url: string;
    excerpt: string;
    publishedAt: string;
    points: number;
  }[];
  const original = (await adapter.db.query('SELECT id,enabled FROM topics'))
    .rows;
  try {
    await adapter.db.query('UPDATE topics SET enabled=false');
    await adapter.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,story_budget,post_budget)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Golden science','Synthetic science fixture','',100,2,0)`,
      [topic],
    );
    await adapter.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Golden publisher','feed','https://example.org/golden/feed')`,
      [source, topic],
    );
    await adapter.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topic, source],
    );
    for (const item of items) {
      await adapter.db.query(
        `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at,engagement) VALUES($1,$2,$3,$4,$5,$6)`,
        [
          item.id,
          item.url,
          item.title,
          item.excerpt,
          item.publishedAt,
          { points: item.points },
        ],
      );
      await adapter.db.query(
        'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
        [source, item.id],
      );
    }
    const expected = fixture('non-ai-golden');
    const editions = [];
    for (let i = 0; i < 2; i++) {
      const edition = digestPreviewSchema.parse(
        await repository.generate(
          new Date(expected.windowStart),
          new Date(expected.windowEnd),
        ),
      );
      assert.deepEqual(await repository.find(edition.id), edition);
      const { id: _id, createdAt: _createdAt, ...stable } = edition;
      assert.deepEqual(stable, expected);
      editions.push(edition);
    }
    assert.notEqual(editions[0].id, editions[1].id);
    assert.deepEqual(await repository.find(editions[0].id), editions[0]);
  } finally {
    await adapter.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source],
    );
    await adapter.db.query(
      'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
      [items.map((item) => item.id)],
    );
    await adapter.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    await adapter.db.query('DELETE FROM content_sources WHERE id=$1', [source]);
    for (const row of original)
      await adapter.db.query('UPDATE topics SET enabled=$2 WHERE id=$1', [
        row.id,
        row.enabled,
      ]);
    await adapter.onModuleDestroy();
  }
});
