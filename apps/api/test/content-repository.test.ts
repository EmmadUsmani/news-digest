import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { reportingExcerpt } from '../src/modules/digests/domain/reporting-excerpt';
import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import {
  type ContentItem,
  type Source,
} from '../src/modules/ingestion/domain/ports';

void test('recorded HUD rediscovery exposes legacy excerpt provenance loss without erasing reporting', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const topicId = randomUUID();
  const source: Source = {
    id: `hud-${topicId}`,
    topicId,
    name: 'Recorded HUD fixture',
    kind: 'feed',
    url: 'https://example.org/recorded-hud',
  };
  const stored = JSON.parse(
    await readFile(
      'apps/api/test/fixtures/google-hud-stored-2026-11-14.json',
      'utf8',
    ),
  ) as {
    url: string;
    title: string;
    excerpt: string;
    publisher: { name: string; url: string };
  };
  const [fresh] = parseFeed(
    await readFile('apps/api/test/fixtures/google-hud-2026-11-14.xml', 'utf8'),
  );
  assert.equal(fresh.url, stored.url);
  assert.equal(fresh.title, stored.title);
  assert.equal(fresh.excerpt, '');
  const persisted = async () =>
    (
      await repository.db.query(
        'SELECT canonical_url AS url,title,excerpt,publisher FROM content_items WHERE canonical_url=$1',
        [fresh.url],
      )
    ).rows[0] as typeof stored;
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       SELECT $1,id,'HUD provenance fixture','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    await repository.db.query(
      'INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)',
      [source.id, topicId, source.name, source.kind, source.url],
    );
    // The earlier observation's original title/body was not saved. Seed only
    // the recorded current storage state; this is not a reconstructed old feed.
    await repository.store(source, [{ ...fresh, ...stored }]);
    await repository.store(source, [fresh]);
    assert.deepEqual(await persisted(), stored);
    // Known defect, deliberately characterized until the post-hold repair:
    // the changed headline survives both blank preservation and exact matching.
    assert.equal(reportingExcerpt(await persisted()), stored.excerpt);
    assert.notEqual(reportingExcerpt(await persisted()), '');

    // Synthetic reporting control: clearing all retained excerpts on blank
    // rediscovery would destroy real reporting as well as this headline.
    const report =
      'The division will oversee department data governance, according to the supplied report.';
    await repository.store(source, [{ ...fresh, excerpt: report }]);
    await repository.store(source, [fresh]);
    assert.equal(reportingExcerpt(await persisted()), report);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [
      source.id,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [fresh.url],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await repository.onModuleDestroy();
  }
});

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
    const windowRows = await repository.latest({
      topicId,
      start: new Date(items[0].publishedAt),
      end: new Date(items[6].publishedAt),
    });
    assert.equal(windowRows.length, 1);
    assert.deepEqual(
      windowRows[0].items.map((row: { url: string }) => row.url),
      [5, 4, 3, 2, 1, 0].map((index) => url(String(index))),
    );
    assert.deepEqual(
      (
        await repository.latest({
          topicId,
          start: new Date('2040-01-01'),
          end: new Date('2040-01-02'),
        })
      )[0].items,
      [],
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
    // HN or a sparse feed may rediscover the same publisher URL without text.
    // Keep the saved text while still updating its title and engagement.
    for (const excerpt of ['', '   ']) {
      await repository.store(sources[1], [
        {
          ...items[6],
          title: 'Title-only rediscovery',
          excerpt,
          engagement: { points: 110 },
        },
      ]);
      const retained = (await latest())!.items.find(
        (candidate) => candidate.id === first[0].id,
      );
      assert.equal(retained?.title, 'Title-only rediscovery');
      assert.equal(
        (
          await repository.db.query(
            'SELECT excerpt FROM content_items WHERE canonical_url=$1',
            [items[6].url],
          )
        ).rows[0].excerpt,
        'Updated excerpt',
      );
    }
    // A later real excerpt still replaces the previous version.
    await repository.store(sources[0], [
      { ...items[6], title: 'Updated title', excerpt: 'Corrected report' },
    ]);
    assert.equal(
      (
        await repository.db.query(
          'SELECT excerpt FROM content_items WHERE canonical_url=$1',
          [items[6].url],
        )
      ).rows[0].excerpt,
      'Corrected report',
    );
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
      (
        await repository.latest({
          topicId,
          start: new Date('2034-01-01'),
          end: new Date('2036-01-01'),
        })
      ).length,
      1,
    );
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

void test('source failure and empty recovery preserve retained content and independent source health', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const topicId = randomUUID();
  const source: Source = {
    id: `health-${topicId}`,
    topicId,
    name: 'Health fixture',
    kind: 'feed',
    url: `https://example.org/${topicId}`,
  };
  const other: Source = { ...source, id: `${source.id}-other` };
  const status = async (id: string) =>
    (await repository.status()).find((row: { id: string }) => row.id === id);
  const health = async () =>
    (
      await repository.db.query(
        'SELECT last_attempt,last_success,last_error,last_item_count FROM content_sources WHERE id=$1',
        [source.id],
      )
    ).rows[0];
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position) SELECT $1,id,'Health fixture','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    for (const row of [source, other])
      await repository.db.query(
        'INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)',
        [row.id, topicId, row.name, row.kind, row.url],
      );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topicId, source.id],
    );
    await repository.failed(source, 'First attempt failed');
    const first = await health();
    assert.ok(first.last_attempt instanceof Date);
    assert.equal(first.last_success, null);
    assert.equal(first.last_error, 'First attempt failed');
    const item: ContentItem = {
      url: `${source.url}/story`,
      title: 'Retained story',
      excerpt: 'Evidence',
      author: null,
      publishedAt: '2035-01-01T00:00:00Z',
      imageUrl: null,
      engagement: { points: 5 },
    };
    await repository.store(source, [item]);
    const successful = await health();
    assert.equal(successful.last_error, null);
    assert.equal(successful.last_item_count, 1);
    assert.deepEqual(successful.last_attempt, successful.last_success);
    const content = (await repository.latest()).find(
      (row: { topicId: string }) => row.topicId === topicId,
    );
    const independent = await status(other.id);
    await repository.failed(source, 'Upstream unavailable');
    const failed = await health();
    assert.deepEqual(failed.last_success, successful.last_success);
    assert.equal(failed.last_item_count, 1);
    assert.ok(failed.last_attempt >= successful.last_attempt);
    assert.equal(failed.last_error, 'Upstream unavailable');
    // Bound persisted diagnostics without losing the last successful poll.
    for (const message of [
      'x'.repeat(299),
      '界'.repeat(300),
      '界'.repeat(301),
    ]) {
      await repository.failed(source, message);
      const bounded = await status(source.id);
      assert.equal(bounded.error, message.slice(0, 300));
      assert.deepEqual(bounded.lastSuccess, successful.last_success);
      assert.equal(bounded.lastItemCount, 1);
      assert.equal(bounded.storedItems, 1);
    }
    const beforeRejectedError = await status(source.id);
    await assert.rejects(repository.failed(source, 'Invalid\u0000diagnostic'));
    assert.deepEqual(await status(source.id), beforeRejectedError);
    await repository.failed(source, 'Retry after rejected diagnostic');
    assert.equal(
      (await status(source.id)).error,
      'Retry after rejected diagnostic',
    );
    await repository.store(source, []);
    const recovered = await health();
    assert.equal(recovered.last_error, null);
    assert.equal(recovered.last_item_count, 0);
    assert.deepEqual(recovered.last_attempt, recovered.last_success);
    assert.ok(recovered.last_success >= failed.last_attempt);
    assert.equal((await status(source.id)).storedItems, 1);
    assert.deepEqual(
      (await repository.latest()).find(
        (row: { topicId: string }) => row.topicId === topicId,
      ),
      content,
    );
    assert.deepEqual(await status(other.id), independent);
    await repository.store(source, []);
    assert.equal((await status(source.id)).storedItems, 1);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [topicId],
    );
    await repository.db.query('DELETE FROM content_sources WHERE topic_id=$1', [
      topicId,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [`${source.url}/story`],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await repository.onModuleDestroy();
  }
});

void test('shared feed collection follows active connections and preserves observations after disconnect', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const topicIds = [randomUUID(), randomUUID()];
  const source: Source = {
    id: `shared-${topicIds[0]}`,
    topicId: topicIds[0],
    name: 'Shared feed',
    kind: 'feed',
    url: `https://example.org/shared-${topicIds[0]}`,
  };
  const collected = async () =>
    (await repository.sources()).filter((row) => row.id === source.id);
  const views = async () =>
    (await repository.latest()).filter((row) => topicIds.includes(row.topicId));
  try {
    for (const [index, id] of topicIds.entries()) {
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        SELECT $1,id,$2,'','',$3 FROM profiles LIMIT 1`,
        [id, `Shared topic ${index}`, 110 + index],
      );
    }
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)`,
      [source.id, source.topicId, source.name, source.kind, source.url],
    );
    for (const id of topicIds)
      await repository.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [id, source.id],
      );
    assert.deepEqual(await collected(), [source]);
    await repository.store(source, [
      {
        url: `${source.url}/story`,
        title: 'Shared story',
        excerpt: '',
        author: null,
        imageUrl: null,
        publishedAt: '2035-01-01T00:00:00Z',
        engagement: { points: 9 },
      },
    ]);
    const initial = await views();
    assert.equal(initial.length, 2);
    assert.equal(initial[0].items.length, 1);
    assert.deepEqual(initial[0].items, initial[1].items);
    // The legacy source owner is disabled; the other active connection still admits collection.
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topicIds[0],
    ]);
    assert.deepEqual(await collected(), [source]);
    assert.deepEqual(await views(), [initial[1]]);
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1 AND source_id=$2',
      [topicIds[1], source.id],
    );
    assert.deepEqual(await collected(), []);
    assert.deepEqual(await views(), [{ topicId: topicIds[1], items: [] }]);
    const retained = (await repository.status()).find(
      (row) => row.id === source.id,
    );
    assert.equal(retained.storedItems, 1);
    assert.equal(retained.lastItemCount, 1);
    await repository.db.query('UPDATE topics SET enabled=true WHERE id=$1', [
      topicIds[0],
    ]);
    assert.deepEqual(await collected(), [source]);
    assert.deepEqual(await views(), [
      initial[0],
      { topicId: topicIds[1], items: [] },
    ]);
    assert.deepEqual(
      (await repository.status()).find((row) => row.id === source.id),
      retained,
    );
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [
      source.id,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [`${source.url}/story`],
    );
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topicIds,
    ]);
    await repository.onModuleDestroy();
  }
});

void test('concurrent publishers merge one canonical item without losing observations or engagement', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const topicId = randomUUID();
  const prefix = `concurrent-${topicId}`;
  const sources: Source[] = ['a', 'b'].map((suffix) => ({
    id: `${prefix}-${suffix}`,
    topicId,
    name: `Publisher ${suffix}`,
    kind: 'feed',
    url: `https://example.org/${prefix}/${suffix}`,
  }));
  const item: ContentItem = {
    url: `https://example.org/${prefix}/story`,
    title: 'Shared story',
    excerpt: 'Shared excerpt',
    author: 'Reporter',
    imageUrl: null,
    publishedAt: '2035-01-01T00:00:00Z',
    engagement: {},
  };
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       SELECT $1,id,'Concurrent publishers','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    for (const source of sources) {
      await repository.db.query(
        'INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)',
        [source.id, topicId, source.name, source.kind, source.url],
      );
      await repository.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topicId, source.id],
      );
    }
    await Promise.all([
      repository.store(sources[0], [{ ...item, engagement: { points: 12 } }]),
      repository.store(sources[1], [{ ...item, engagement: { comments: 7 } }]),
    ]);
    const persisted = await repository.db.query(
      'SELECT id,engagement FROM content_items WHERE canonical_url=$1',
      [item.url],
    );
    assert.equal(persisted.rowCount, 1);
    assert.deepEqual(persisted.rows[0].engagement, { points: 12, comments: 7 });
    const latest = (await repository.latest()).find(
      (row) => row.topicId === topicId,
    );
    assert.equal(latest.items.length, 1);
    assert.equal(latest.items[0].id, persisted.rows[0].id);
    assert.equal(latest.items[0].source, 'Publisher a');
    await Promise.all(
      sources.map((source) => repository.store(source, [item, item])),
    );
    assert.deepEqual(
      (
        await repository.db.query(
          'SELECT id,engagement FROM content_items WHERE canonical_url=$1',
          [item.url],
        )
      ).rows,
      persisted.rows,
    );
    const observations = await repository.db.query(
      'SELECT source_id FROM content_observations WHERE item_id=$1 ORDER BY source_id',
      [persisted.rows[0].id],
    );
    assert.deepEqual(
      observations.rows.map((row) => row.source_id),
      sources.map((source) => source.id),
    );
    const statuses = (await repository.status()).filter((row) =>
      sources.some((source) => source.id === row.id),
    );
    assert.equal(statuses.length, 2);
    for (const status of statuses) {
      assert.equal(status.storedItems, 1);
      assert.equal(status.lastItemCount, 2);
      assert.equal(status.error, null);
      assert.ok(status.lastSuccess);
    }
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=ANY($1::text[])',
      [sources.map((source) => source.id)],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1',
      [topicId],
    );
    await repository.db.query('DELETE FROM content_sources WHERE topic_id=$1', [
      topicId,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [item.url],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await repository.onModuleDestroy();
  }
});

void test('final source-status failure rolls back article batches and citations before a successful retry', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const topicId = randomUUID();
  const source: Source = {
    id: `final-write-${topicId}`,
    topicId,
    name: 'Final write fixture',
    kind: 'feed',
    url: `https://example.org/${topicId}/feed`,
  };
  const original: ContentItem = {
    url: `https://example.org/${topicId}/original`,
    title: 'Original',
    excerpt: 'Original excerpt',
    author: 'Reporter',
    imageUrl: null,
    publishedAt: '2035-01-01T00:00:00Z',
    engagement: { points: 1 },
    xLinks: [
      {
        externalId: '123456789',
        url: 'https://x.com/Reporter/status/123456789',
      },
    ],
  };
  const replacement = {
    ...original,
    title: 'Updated',
    engagement: { points: 8 },
  };
  const added = {
    ...original,
    url: `https://example.org/${topicId}/added`,
    title: 'Added',
  };
  const snapshot = async () => ({
    status: (await repository.status()).find((row) => row.id === source.id),
    preview: (await repository.latest()).find((row) => row.topicId === topicId),
    // No public detail/citation reader exposes all retained evidence.
    items: (
      await repository.db.query(
        'SELECT * FROM content_items WHERE canonical_url=ANY($1::text[]) ORDER BY canonical_url',
        [[original.url, added.url]],
      )
    ).rows,
    citations: (
      await repository.db.query(
        'SELECT * FROM x_link_citations WHERE source_id=$1 ORDER BY item_id,external_id',
        [source.id],
      )
    ).rows,
  });
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      SELECT $1,id,'Final write fixture','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    await repository.db.query(
      'INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)',
      [source.id, topicId, source.name, source.kind, source.url],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topicId, source.id],
    );
    await repository.store(source, [original]);
    await repository.failed(source, 'Retained diagnostic');
    const before = await snapshot();
    await repository.db
      .query(`ALTER TABLE content_sources ADD CONSTRAINT ingestion_final_write_fixture
      CHECK (id <> 'final-write-${topicId}' OR last_item_count <> 2)`);
    await assert.rejects(
      repository.store(source, [replacement, added]),
      /ingestion_final_write_fixture/,
    );
    assert.deepEqual(await snapshot(), before);
    await repository.db.query(
      'ALTER TABLE content_sources DROP CONSTRAINT ingestion_final_write_fixture',
    );
    await repository.store(source, [replacement, added]);
    const after = await snapshot();
    assert.equal(after.items.length, 2);
    const retained = after.items.find(
      (row) => row.canonical_url === original.url,
    )!;
    assert.equal(retained.id, before.items[0].id);
    assert.equal(retained.title, 'Updated');
    assert.deepEqual(retained.engagement, { points: 8 });
    assert.equal(after.preview.items.length, 2);
    assert.equal(after.citations.length, 2);
    const citation = after.citations.find(
      (row) => row.item_id === retained.id,
    )!;
    assert.deepEqual(citation.first_seen_at, before.citations[0].first_seen_at);
    assert.deepEqual(citation.citing_engagement, { points: 8 });
    assert.equal(after.status.storedItems, 2);
    assert.equal(after.status.lastItemCount, 2);
    assert.equal(after.status.error, null);
    assert.ok(after.status.lastSuccess >= before.status.lastSuccess);
    await repository.store(source, [replacement, added]);
    const repeated = await snapshot();
    assert.equal(repeated.items.length, 2);
    assert.equal(repeated.citations.length, 2);
    assert.equal(repeated.status.storedItems, 2);
  } finally {
    await repository.db.query(
      'ALTER TABLE content_sources DROP CONSTRAINT IF EXISTS ingestion_final_write_fixture',
    );
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [source.id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [
      source.id,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=ANY($1::text[])',
      [[original.url, added.url]],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await repository.onModuleDestroy();
  }
});

void test('concurrent ingestion merges engagement while retaining independent observations and citations', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresContentRepository();
  const competing = new PostgresContentRepository();
  const topicId = randomUUID();
  const sources: Source[] = ['a', 'b'].map((suffix) => ({
    id: `concurrent-${topicId}-${suffix}`,
    topicId,
    name: `Concurrent fixture ${suffix}`,
    kind: 'feed',
    url: `https://example.org/${topicId}/${suffix}`,
  }));
  const original: ContentItem = {
    url: `https://example.org/${topicId}/shared`,
    title: 'Original title',
    excerpt: 'Original excerpt',
    author: 'Original reporter',
    imageUrl: `https://example.org/${topicId}/image`,
    publishedAt: '2035-01-01T00:00:00Z',
    engagement: { views: 100 },
  };
  const variants: ContentItem[] = sources.map((_, index) => ({
    ...original,
    title: `Update ${index}`,
    excerpt: `Excerpt ${index}`,
    author: `Replacement ${index}`,
    imageUrl: null,
    publishedAt: '2036-01-01T00:00:00Z',
    engagement: index === 0 ? { points: 30 } : { comments: 8 },
    xLinks: [
      {
        externalId: '123456789',
        url: 'https://x.com/Reporter/status/123456789',
      },
    ],
  }));
  const retained = async () =>
    (
      await repository.db.query(
        'SELECT * FROM content_items WHERE canonical_url=$1',
        [original.url],
      )
    ).rows;
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       SELECT $1,id,'Concurrent ingestion fixture','','',100 FROM profiles LIMIT 1`,
      [topicId],
    );
    for (const source of sources) {
      await repository.db.query(
        'INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,$3,$4,$5)',
        [source.id, topicId, source.name, source.kind, source.url],
      );
      await repository.db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topicId, source.id],
      );
    }
    await repository.store(sources[0], [original]);
    const [before] = await retained();
    const ingestBoth = () =>
      Promise.all([
        repository.store(sources[0], [variants[0]]),
        competing.store(sources[1], [variants[1]]),
      ]);
    await ingestBoth();
    const verify = async () => {
      const rows = await retained();
      assert.equal(rows.length, 1);
      const [row] = rows;
      assert.equal(row.id, before.id);
      assert.equal(row.author, before.author);
      assert.equal(row.image_url, before.image_url);
      assert.deepEqual(row.published_at, before.published_at);
      assert.deepEqual(row.engagement, { views: 100, points: 30, comments: 8 });
      const winner = variants.find((variant) => variant.title === row.title);
      assert.ok(winner);
      assert.equal(row.excerpt, winner.excerpt);
      const citations = (
        await repository.db.query(
          'SELECT source_id,item_id,citing_engagement,first_seen_at FROM x_link_citations WHERE item_id=$1 ORDER BY source_id',
          [row.id],
        )
      ).rows;
      assert.deepEqual(
        citations.map((citation) => citation.source_id),
        sources.map((source) => source.id),
      );
      assert.deepEqual(
        citations.map((citation) => citation.citing_engagement),
        variants.map((variant) => variant.engagement),
      );
      const states = (await repository.status()).filter((source) =>
        sources.some((fixture) => fixture.id === source.id),
      );
      assert.equal(states.length, 2);
      for (const state of states) {
        assert.equal(state.storedItems, 1);
        assert.equal(state.lastItemCount, 1);
        assert.equal(state.error, null);
        assert.ok(state.lastSuccess);
      }
      return citations;
    };
    const citations = await verify();
    await ingestBoth();
    assert.deepEqual(await verify(), citations);
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
      'DELETE FROM content_items WHERE canonical_url=$1',
      [original.url],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topicId]);
    await Promise.all([
      repository.onModuleDestroy(),
      competing.onModuleDestroy(),
    ]);
  }
});
