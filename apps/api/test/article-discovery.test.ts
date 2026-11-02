import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { RiverDiscovery } from '../src/modules/social/adapters/river-discovery';
import { collectArticleLinks } from '../src/modules/social/application/collect-article-links';
import { PostgresArticleDiscoveryRepository } from '../src/modules/social/database/article-discovery.repository';
import type { DiscoveryArticle } from '../src/modules/social/domain/article-discovery.port';

void test('publisher pass bounds requests, validates exact hosts, stops failed hosts and propagates persistence errors', async () => {
  const article = (id: string, host = 'example.org'): DiscoveryArticle => ({
    id,
    host,
    url: `https://${host}/${id}`,
  });
  const calls: string[] = [];
  const recorded: string[] = [];
  const repository = {
    candidates: async () => [
      article('bad', 'blocked.example'),
      article('skip', 'blocked.example'),
      { ...article('unsafe'), url: 'https://example.org.evil.test/story' },
      {
        ...article('credentials'),
        url: 'https://user:password@example.org/story',
      },
      ...Array.from({ length: 12 }, (_, i) => article(String(i))),
    ],
    record: async (a: DiscoveryArticle) => {
      recorded.push(a.id);
    },
  };
  const result = await collectArticleLinks(repository, {
    collect: async (url) => {
      calls.push(url);
      if (url.includes('blocked.example')) throw new Error('HTTP 403');
      return [];
    },
  });
  assert.deepEqual(result, { checked: 4, citations: 0, errors: 1 });
  assert.equal(calls.length, 5);
  assert.deepEqual(recorded, ['bad', '0', '1', '2', '3']);
  await assert.rejects(
    collectArticleLinks(
      {
        ...repository,
        record: async () => {
          throw new Error('DB unavailable');
        },
      },
      { collect: async () => [] },
    ),
    /DB unavailable/,
  );
});

void test('publisher candidates preserve provenance and idempotence, respect cooldowns, topic state and exact opt-in hosts', async () => {
  const repository = new PostgresArticleDiscoveryRepository();
  const ids: string[] = [];
  const enabled = (
    await repository.db.query<{ id: string }>(
      'SELECT id FROM topics WHERE enabled',
    )
  ).rows;
  const topic = crypto.randomUUID();
  const source = `article-fixture-${topic}`;
  try {
    await repository.db.query('UPDATE topics SET enabled=false');
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position) VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',100)`,
      [topic],
    );
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host) VALUES($1,$2,'Fixture','feed','https://example.org/feed','example.org')`,
      [source, topic],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topic, source],
    );
    for (const url of [
      'https://example.org/current',
      'https://example.org.evil.test/current',
      'https://example.org/old',
    ]) {
      const row = await repository.db.query<{ id: string }>(
        `INSERT INTO content_items(canonical_url,title,excerpt,published_at) VALUES($1,'Fixture','Fixture',now()-$2::interval) RETURNING id`,
        [url, url.endsWith('/old') ? '4 days' : '1 hour'],
      );
      ids.push(row.rows[0].id);
      await repository.db.query(
        'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
        [ids.at(-1), source],
      );
    }
    const candidates = await repository.candidates();
    assert.equal(candidates.length, 1);
    const a = candidates[0];
    const links = [
      {
        externalId: '999300000000000001',
        url: 'https://x.com/fixture/status/999300000000000001',
        verificationUrl:
          'https://twitter.com/fixture/status/999300000000000001',
      },
    ];
    await repository.record(a, links);
    await repository.record(a, links);
    assert.deepEqual(await repository.candidates(), []);
    const citations = await repository.db.query(
      'SELECT * FROM x_link_citations WHERE item_id=$1',
      [a.id],
    );
    assert.equal(citations.rowCount, 1);
    assert.equal(citations.rows[0].source_id, source);
    assert.equal(citations.rows[0].verification_url, links[0].verificationUrl);
    assert.deepEqual(citations.rows[0].citing_engagement, {});
    await repository.db.query(
      "UPDATE article_x_discovery_checks SET checked_at=now()-interval '2 days' WHERE item_id=$1",
      [a.id],
    );
    assert.deepEqual(await repository.candidates(), []); // successful pages wait seven days
    await repository.record(a, null);
    await repository.db.query(
      "UPDATE article_x_discovery_checks SET checked_at=now()-interval '2 days' WHERE item_id=$1",
      [a.id],
    );
    assert.equal((await repository.candidates()).length, 1); // errors retry after one day
    await repository.record(a, []);
    assert.equal(
      (
        await repository.db.query(
          'SELECT * FROM x_link_citations WHERE item_id=$1',
          [a.id],
        )
      ).rowCount,
      1,
    );
    assert.equal(
      (
        await repository.db.query(
          'SELECT last_error FROM article_x_discovery_checks WHERE item_id=$1',
          [a.id],
        )
      ).rows[0].last_error,
      null,
    );
    await repository.db.query(
      'DELETE FROM article_x_discovery_checks WHERE item_id=$1',
      [a.id],
    );
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.deepEqual(await repository.candidates(), []);
  } finally {
    await repository.db.query(
      'DELETE FROM x_link_citations WHERE source_id=$1',
      [source],
    );
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [source],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [
      source,
    ]);
    await repository.db.query(
      'DELETE FROM content_items WHERE id=ANY($1::uuid[])',
      [ids],
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    await repository.db.query(
      'UPDATE topics SET enabled=true WHERE id=ANY($1::uuid[])',
      [enabled.map((t) => t.id)],
    );
    await repository.db.end();
  }
});

void test('recorded Yahoo article citation yields named verification URL without fetching X', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/yahoo-article-x.txt',
    'utf8',
  );
  const pages = new RiverDiscovery({ get: async () => html });
  assert.deepEqual(
    await pages.collect('https://sports.yahoo.com/articles/recorded'),
    [
      {
        externalId: '2117105625003921444',
        url: 'https://x.com/i/web/status/2117105625003921444',
        verificationUrl:
          'https://twitter.com/ESPNNBA/status/2117105625003921444',
      },
    ],
  );
});
