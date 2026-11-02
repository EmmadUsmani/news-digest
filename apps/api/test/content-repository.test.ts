import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import {
  type ContentItem,
  type Source,
} from '../src/modules/ingestion/domain/ports';

void test('content repository characterizes eligibility, shared observations, ordering, upserts and rollback', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
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
    // Ingestion owns citation persistence too: untrusted IDs are derived from URLs.
    const citationRows = async () =>
      (
        await repository.db.query(
          `SELECT external_id,source_id,canonical_url,verification_url,citing_engagement,
           first_seen_at,last_seen_at FROM x_link_citations
           WHERE source_id=ANY($1::text[]) ORDER BY source_id,external_id`,
          [sources.map((source) => source.id)],
        )
      ).rows;
    const cited: ContentItem = {
      ...items[6],
      engagement: { points: 12, nested: { replies: 3 }, tags: ['fixture'] },
      xLinks: [
        {
          externalId: 'forged',
          url: 'https://x.com/Reporter/status/123456789',
        },
        {
          externalId: '123456789',
          url: 'https://twitter.com/Reporter/status/123456789',
        },
        {
          externalId: '999',
          url: 'https://x.com.evil.test/Reporter/status/999',
        },
      ],
    };
    await repository.store(sources[0], [cited, cited]);
    const initialCitations = await citationRows();
    assert.equal(initialCitations.length, 1);
    assert.equal(initialCitations[0].external_id, '123456789');
    assert.equal(
      initialCitations[0].canonical_url,
      'https://x.com/i/web/status/123456789',
    );
    assert.equal(
      initialCitations[0].verification_url,
      'https://twitter.com/Reporter/status/123456789',
    );
    assert.deepEqual(initialCitations[0].citing_engagement, cited.engagement);
    await repository.store(sources[0], [
      {
        ...cited,
        engagement: { points: 30 },
        xLinks: [
          {
            externalId: 'ignored',
            url: 'https://x.com/i/web/status/123456789',
          },
        ],
      },
    ]);
    const refreshed = await citationRows();
    assert.equal(refreshed.length, 1);
    assert.deepEqual(refreshed[0].citing_engagement, { points: 30 });
    assert.equal(
      refreshed[0].verification_url,
      initialCitations[0].verification_url,
    );
    assert.deepEqual(
      refreshed[0].first_seen_at,
      initialCitations[0].first_seen_at,
    );
    assert.ok(refreshed[0].last_seen_at >= initialCitations[0].last_seen_at);
    const beforeRollback = await state();
    await assert.rejects(
      repository.store(sources[0], [
        {
          ...cited,
          engagement: { points: 999 },
          xLinks: [
            ...cited.xLinks!,
            { externalId: '222', url: 'https://x.com/Other/status/222' },
          ],
        },
        { ...item(10), publishedAt: 'invalid timestamp' },
      ]),
    );
    assert.deepEqual(await citationRows(), refreshed);
    assert.deepEqual(await state(), beforeRollback);
    await repository.store(sources[1], [cited]);
    const independent = await citationRows();
    assert.equal(independent.length, 2);
    assert.deepEqual(
      independent.map((row) => row.source_id),
      sources.slice(0, 2).map((source) => source.id),
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
      'DELETE FROM x_link_citations WHERE source_id=ANY($1::text[])',
      [sources.map((source) => source.id)],
    );
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
