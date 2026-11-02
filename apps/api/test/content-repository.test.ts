import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import {
  type ContentItem,
  type Source,
} from '../src/modules/ingestion/domain/ports';

void test('content repository characterizes eligibility, shared observations, ordering, upserts and rollback', async () => {
  const repository = new PostgresContentRepository();
  const topicId = randomUUID();
  const prefix = `content-${topicId}`;
  const url = (suffix: string) => `https://example.org/${prefix}/${suffix}`;
  const sources: Source[] = ['a', 'b', 'unconnected'].map((suffix) => ({
    id: `${prefix}-${suffix}`,
    topicId,
    name: `Fixture ${suffix}`,
    kind: 'feed',
    url: url(suffix),
  }));
  const item = (index: number): ContentItem => ({
    url: url(String(index)),
    title: `Story ${index}`,
    excerpt: 'Original excerpt',
    author: 'Original author',
    imageUrl: url('image'),
    publishedAt: `2035-01-01T${String(index).padStart(2, '0')}:00:00+05:30`,
    engagement: { points: index, comments: 2 },
  });
  const latest = async () => {
    const rows = (await repository.latest()) as {
      topicId: string;
      items: {
        id: string;
        title: string;
        url: string;
        publishedAt: string;
        source: string;
      }[];
    }[];
    return rows.find((row) => row.topicId === topicId);
  };
  const state = async () =>
    (
      (await repository.status()) as {
        id: string;
        storedItems: number;
        lastItemCount: number;
        lastSuccess: Date | null;
        error: string | null;
      }[]
    ).find((row) => row.id === sources[0].id)!;
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      SELECT $1,id,'Content fixture','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    for (const source of sources) {
      await repository.db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)`,
        [source.id, topicId, source.name, source.kind, source.url],
      );
    }
    await repository.db.query(
      `INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2),($1,$3)`,
      [topicId, sources[0].id, sources[1].id],
    );
    const eligible = (await repository.sources()).filter((source) =>
      source.id.startsWith(prefix),
    );
    assert.deepEqual(
      eligible.map((source) => source.id),
      sources.slice(0, 2).map((source) => source.id),
    );
    assert.deepEqual((await latest())?.items, []);
    const items = Array.from({ length: 7 }, (_, index) => item(index));
    await repository.store(sources[0], [
      ...items,
      items[0],
      { ...item(8), url: url('betting/promo') },
    ]);
    await repository.store(sources[1], [items[6]]);
    const first = (await latest())!.items;
    assert.deepEqual(
      first.map((row) => row.url),
      [6, 5, 4, 3, 2].map((index) => url(String(index))),
    );
    assert.equal(first[0].source, 'Fixture a');
    assert.equal(first[0].publishedAt, '2035-01-01T00:30:00+00:00');
    assert.equal((await state()).storedItems, 8);
    assert.equal((await state()).lastItemCount, 9);

    await repository.store(sources[0], [
      {
        ...items[6],
        title: 'Updated title',
        excerpt: 'Updated excerpt',
        author: 'Replacement',
        publishedAt: '2040-01-01T00:00:00Z',
        imageUrl: null,
        engagement: { points: 99 },
      },
    ]);
    assert.equal((await latest())!.items[0].id, first[0].id);
    assert.equal((await latest())!.items[0].title, 'Updated title');
    assert.equal((await latest())!.items[0].publishedAt, first[0].publishedAt);
    // No public detail reader exists; inspect persisted fields without depending on query text.
    const persisted = (
      await repository.db.query(
        'SELECT excerpt,author,image_url,engagement FROM content_items WHERE canonical_url=$1',
        [items[6].url],
      )
    ).rows[0];
    assert.deepEqual(persisted, {
      excerpt: 'Updated excerpt',
      author: 'Original author',
      image_url: url('image'),
      engagement: { points: 99, comments: 2 },
    });
    await repository.failed(sources[0], 'x'.repeat(350));
    const failed = await state();
    assert.equal(failed.error?.length, 300);
    assert.ok(failed.lastSuccess);
    await assert.rejects(
      repository.store(sources[0], [
        { ...items[6], title: 'Must roll back' },
        item(9),
        { ...item(10), publishedAt: 'invalid timestamp' },
      ]),
    );
    assert.deepEqual(await state(), failed);
    assert.equal((await latest())!.items[0].title, 'Updated title');
    assert.equal(
      (
        await repository.db.query(
          'SELECT id FROM content_items WHERE canonical_url=$1',
          [item(9).url],
        )
      ).rowCount,
      0,
    );
    await repository.store(sources[0], []);
    assert.equal((await state()).error, null);
    assert.equal((await state()).lastItemCount, 0);
    assert.equal((await state()).storedItems, 8);
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topicId,
    ]);
    assert.equal(await latest(), undefined);
    assert.equal(
      (await repository.sources()).some((source) =>
        source.id.startsWith(prefix),
      ),
      false,
    );
    assert.equal((await state()).storedItems, 8);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=ANY($1::text[])',
      [sources.map((source) => source.id)],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [topicId],
    );
    await repository.db.query(
      'DELETE FROM content_sources WHERE id=ANY($1::text[])',
      [sources.map((source) => source.id)],
    );
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url LIKE $1',
      [`https://example.org/${prefix}/%`],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await repository.onModuleDestroy();
  }
});
