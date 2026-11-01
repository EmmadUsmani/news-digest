import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { HackerNewsAdapter } from '../src/modules/ingestion/adapters/hn.adapter';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';
import { ingest } from '../src/modules/ingestion/ingest';
const fixture = (name: string) =>
  readFile(`apps/api/test/fixtures/${name}`, 'utf8');
void test('recorded RSS and Atom normalize real headlines, dates and safe links', async () => {
  for (const name of [
    'rss.xml',
    'atom.xml',
    'yahoo-nba.xml',
    'eurogamer.xml',
    'npr-world.xml',
    'guardian-world.xml',
  ]) {
    const items = parseFeed(await fixture(name));
    assert.equal(items.length, 2);
    assert.ok(
      items.every(
        (i) =>
          i.title && i.url.startsWith('https://') && Date.parse(i.publishedAt),
      ),
    );
  }
  assert.throws(() => parseFeed('<html>blocked</html>'), /Unsupported/);
  assert.throws(() => parseFeed('<!DOCTYPE rss><rss/>'), /Invalid/);
  const encoded = parseFeed(
    '<rss><channel><item><title>A &amp;amp; B &#039;ok&#039;</title><link>https://example.org/?a=1&amp;b=2</link><pubDate>2026-11-01T00:00:00Z</pubDate></item></channel></rss>',
  )[0];
  assert.equal(encoded.title, "A & B 'ok'");
  assert.equal(encoded.url, 'https://example.org/?a=1&b=2');
  assert.equal(
    parseFeed(
      '<rss><channel><item><title>No date</title><link>https://example.org</link></item></channel></rss>',
    ).length,
    0,
  );
  assert.equal(
    canonicalUrl('https://example.org/a?utm_source=x&b=2#top'),
    'https://example.org/a?b=2',
  );
  assert.equal(canonicalUrl('javascript:alert(1)'), null);
});
void test('recorded world feeds retain publisher links, bylines and plain excerpts', async () => {
  const npr = parseFeed(await fixture('npr-world.xml'));
  assert.equal(npr[0].author, 'Ayesha Rascoe');
  assert.equal(npr[0].publishedAt, '2026-11-01T13:15:28.000Z');
  assert.ok(npr.every((item) => new URL(item.url).hostname === 'www.npr.org'));
  assert.match(npr[1].excerpt, /ministers' meeting/);
  const guardian = parseFeed(await fixture('guardian-world.xml'));
  assert.ok(
    guardian.every(
      (item) => new URL(item.url).hostname === 'www.theguardian.com',
    ),
  );
  assert.match(guardian[0].title, /illegal gold mining/);
  assert.ok(guardian[0].author);
  assert.doesNotMatch(guardian[0].excerpt, /<\/?(?:p|a|em)\b/);
  assert.ok(guardian[0].imageUrl?.startsWith('https://'));
});
void test('recorded platform feeds preserve first-party links, dates and author attribution', async () => {
  const playstation = parseFeed(await fixture('playstation.xml'));
  const xbox = parseFeed(await fixture('xbox.xml'));
  assert.equal(playstation.length, 2);
  assert.equal(xbox.length, 2);
  assert.ok(
    playstation.every(
      (item) => new URL(item.url).hostname === 'blog.playstation.com',
    ),
  );
  assert.ok(
    xbox.every((item) => new URL(item.url).hostname === 'news.xbox.com'),
  );
  assert.equal(playstation[0].publishedAt, '2026-10-30T16:55:53.000Z');
  assert.equal(playstation[0].author, 'O’Dell Harmon Jr. (he/him)');
  assert.equal(xbox[1].author, 'Mike Nelson, XBOX Wire Editor');
  assert.match(xbox[1].excerpt, /Avatar State Patch is available today/);
  assert.doesNotMatch(xbox[1].excerpt, /<\/?(?:p|a)\b|&#\d+;/);
  assert.ok(
    [...playstation, ...xbox].every((item) => item.excerpt.length <= 1500),
  );
});
void test('recorded PC gaming feeds retain publisher bylines, excerpts and lead media', async () => {
  const pcgamer = parseFeed(await fixture('pcgamer.xml'));
  const rps = parseFeed(await fixture('rps.xml'));
  assert.equal(pcgamer.length, 2);
  assert.equal(rps.length, 2);
  assert.ok(
    pcgamer.every((item) => new URL(item.url).hostname === 'www.pcgamer.com'),
  );
  assert.ok(
    rps.every(
      (item) => new URL(item.url).hostname === 'www.rockpapershotgun.com',
    ),
  );
  assert.equal(pcgamer[0].author, 'Justin Wagner');
  assert.equal(pcgamer[0].publishedAt, '2026-11-01T18:41:29.000Z');
  assert.equal(
    pcgamer[0].excerpt,
    'Melvor Idle 2 has gained a subtitle: A RuneScape Adventure.',
  );
  assert.equal(rps[0].author, 'Oisin Kuhnke');
  assert.equal(rps[0].publishedAt, '2026-11-01T19:08:44.000Z');
  assert.match(rps[1].excerpt, /February 23rd, 2027/);
  assert.ok(
    [...pcgamer, ...rps].every(
      (item) =>
        item.imageUrl?.startsWith('https://') && item.excerpt.length <= 1500,
    ),
  );
  assert.doesNotMatch(rps[0].excerpt, /<\/?(?:p|a)\b/);
});
void test('Hacker News fixture preserves engagement and excludes deleted items', async () => {
  const records = JSON.parse(await fixture('hn.json'));
  records[0].text = 'It&#x27;s &amp; more <p>text</p>';
  const adapter = new HackerNewsAdapter({
    get: async (url) =>
      url.endsWith('topstories.json')
        ? JSON.stringify([records[0].id, records[1].id, 42])
        : url.endsWith('/42.json')
          ? '{"deleted":true}'
          : JSON.stringify(
              records.find((r: { id: number }) =>
                url.endsWith(`/${r.id}.json`),
              ),
            ),
  });
  const items = await adapter.collect({
    id: 'test',
    topicId: '',
    name: '',
    kind: 'hn',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].engagement.points, records[0].score);
  assert.equal(items[0].excerpt, "It's & more text");
});
void test('Postgres ingestion is idempotent and records failure without losing last success', async () => {
  const repository = new PostgresContentRepository();
  const id = `test-${Date.now()}`;
  try {
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url) SELECT $1,id,'Fixture integration','feed','https://example.org/fixture' FROM topics ORDER BY position LIMIT 1`,
      [id],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) SELECT topic_id,id FROM content_sources WHERE id=$1',
      [id],
    );
    const source = (await repository.sources()).find((s) => s.id === id)!;
    const item = {
      ...parseFeed(await fixture('rss.xml'))[0],
      url: `https://example.org/${id}`,
    };
    const adapter = { collect: async () => [item, item] };
    await ingest(repository, { feed: adapter, hn: adapter }, id);
    await ingest(repository, { feed: adapter, hn: adapter }, id);
    assert.equal(
      (
        await repository.db.query(
          'SELECT count(*)::int AS n FROM content_observations WHERE source_id=$1',
          [id],
        )
      ).rows[0].n,
      1,
    );
    const empty = { collect: async () => [] };
    await assert.rejects(
      ingest(repository, { feed: empty, hn: empty }, id),
      /no usable/,
    );
    const state = (
      await repository.db.query(
        'SELECT last_success,last_error FROM content_sources WHERE id=$1',
        [source.id],
      )
    ).rows[0];
    assert.ok(state.last_success);
    assert.match(state.last_error, /no usable/);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [id],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [id],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [id]);
    await repository.db.query(
      'DELETE FROM content_items WHERE canonical_url=$1',
      [`https://example.org/${id}`],
    );
    await repository.onModuleDestroy();
  }
});
void test('recorded AI announcement feeds preserve publisher dates, missing fields and media', async () => {
  const openai = parseFeed(await fixture('openai.xml'));
  const deepmind = parseFeed(await fixture('deepmind.xml'));
  assert.equal(openai.length, 2);
  assert.equal(deepmind.length, 2);
  assert.ok(
    openai.every((item) => new URL(item.url).hostname === 'openai.com'),
  );
  assert.ok(
    deepmind.every((item) => new URL(item.url).hostname === 'deepmind.google'),
  );
  assert.equal(openai[0].publishedAt, '2026-10-30T09:30:00.000Z');
  assert.match(openai[0].excerpt, /robots.txt/);
  assert.equal(deepmind[0].publishedAt, '2026-10-28T17:00:58.000Z');
  assert.equal(deepmind[0].excerpt, '');
  assert.equal(deepmind[0].author, null);
  assert.equal(deepmind[0].imageUrl, null);
  assert.ok(
    deepmind[1].imageUrl?.startsWith('https://lh3.googleusercontent.com/'),
  );
  assert.ok(
    [...openai, ...deepmind].every((item) => item.excerpt.length <= 1500),
  );
});
