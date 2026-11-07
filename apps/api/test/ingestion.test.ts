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
    'nintendo-life.xml',
    'vgc.xml',
    'gamedeveloper.xml',
    'gamingbolt.xml',
    'pushsquare.xml',
    'gamesradar.xml',
    'gamespot.xml',
    'hoopsrumors.xml',
    'realgm.xml',
    'sbnation-nba.xml',
    'basketball-insiders.xml',
    'yardbarker-nba.xml',
    'destructoid.xml',
    'al-jazeera.xml',
    'aftermath.xml',
    'gematsu.xml',
    'kotaku.xml',
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
void test('recorded Gaming feeds discover X citations from encoded content and descriptions', async () => {
  const bolt = parseFeed(await fixture('gamingbolt.xml'));
  const square = parseFeed(await fixture('pushsquare.xml'));
  assert.deepEqual(
    bolt.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2117074929594298758', '2116088984703209689'],
  );
  assert.deepEqual(
    square.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116822592556580874'],
  );
  assert.equal(bolt[0].publishedAt, '2026-11-02T03:31:07.000Z');
  assert.match(bolt[0].title, /Phantom Blade Zero/);
  assert.ok(
    bolt.every((item) => new URL(item.url).hostname === 'gamingbolt.com'),
  );
  assert.ok(
    square.every((item) => new URL(item.url).hostname === 'www.pushsquare.com'),
  );
  assert.ok([...bolt, ...square].every((item) => item.excerpt.length <= 1500));
});
void test('recorded GamesRadar and GameSpot feeds retain publisher X citations and original dates', async () => {
  const radar = parseFeed(await fixture('gamesradar.xml'));
  const spot = parseFeed(await fixture('gamespot.xml'));
  assert.deepEqual(
    radar.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116073492521394429', '2116088984703209689', '2115337924376141927'],
  );
  assert.deepEqual(
    spot.flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? []),
    ['2116827467977527751'],
  );
  assert.equal(radar[0].publishedAt, '2026-10-30T18:31:42.000Z');
  assert.match(radar[0].title, /Marathon/);
  assert.ok(
    radar.every((item) => new URL(item.url).hostname === 'www.gamesradar.com'),
  );
  assert.ok(
    spot.every((item) => new URL(item.url).hostname === 'www.gamespot.com'),
  );
  assert.ok([...radar, ...spot].every((item) => item.excerpt.length <= 1500));
});
void test('recorded Aftermath RSS preserves article citations and separates excerpts from full content', async () => {
  const items = parseFeed(await fixture('aftermath.xml'));
  assert.equal(items[0].title, 'Itch Is Being Flooded By AI-Generated Garbage');
  assert.equal(items[0].publishedAt, '2026-11-01T23:52:20.000Z');
  assert.equal(items[1].publishedAt, '2026-10-30T19:59:05.000Z');
  assert.deepEqual(items[0].xLinks, []);
  assert.deepEqual(items[1].xLinks, [
    {
      externalId: '2115869254688063857',
      verificationUrl:
        'https://twitter.com/socialistadri/status/2115869254688063857',
      url: 'https://x.com/i/web/status/2115869254688063857',
    },
    {
      externalId: '2043182942982373785',
      verificationUrl:
        'https://twitter.com/HnD_Productions/status/2043182942982373785',
      url: 'https://x.com/i/web/status/2043182942982373785',
    },
  ]);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'aftermath.site'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => !/<[^>]+>/.test(item.excerpt)));
});
void test('recorded Al Jazeera RSS retains World headlines and dates without inventing social citations', async () => {
  const items = parseFeed(await fixture('al-jazeera.xml'));
  assert.equal(
    items[0].title,
    'Sudan files complaints against Ethiopia with UN over deadly drone spree',
  );
  assert.equal(items[0].publishedAt, '2026-11-02T10:25:22.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T10:24:47.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.aljazeera.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(
    items.every((item) => item.author === null && item.imageUrl === null),
  );
  assert.deepEqual(
    items.flatMap((item) => item.xLinks ?? []),
    [],
  );
});
void test('recorded Destructoid RSS preserves encoded-content citations without promoting guide links', async () => {
  const items = parseFeed(await fixture('destructoid.xml'));
  assert.equal(items[0].publishedAt, '2026-11-02T10:22:16.000Z');
  assert.equal(items[0].author, 'Kacee Fay');
  assert.deepEqual(items[0].xLinks, []);
  assert.equal(items[1].publishedAt, '2026-10-31T19:16:39.000Z');
  assert.equal(items[1].author, 'Pedro Peres');
  assert.match(items[1].title, /Bungie’s new leadership/);
  assert.deepEqual(items[1].xLinks, [
    {
      externalId: '2116086082341306812',
      verificationUrl:
        'https://twitter.com/S14deane/status/2116086082341306812',
      url: 'https://x.com/i/web/status/2116086082341306812',
    },
  ]);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.destructoid.com'),
  );
  assert.ok(items.every((item) => item.excerpt.length <= 1500));
  assert.doesNotMatch(items[1].excerpt, /<[^>]+>|&#\d+;/);
});
void test('recorded Hoops Rumors RSS preserves NBA reporter and official team citations', async () => {
  const items = parseFeed(await fixture('hoopsrumors.xml'));
  assert.equal(
    items[0].title,
    'NBA Suspends Hawks’ Kingston Flemings For One Game',
  );
  assert.equal(items[0].publishedAt, '2026-11-02T02:02:18.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T01:09:01.000Z');
  assert.deepEqual(
    items
      .flatMap((item) => item.xLinks?.map((link) => link.externalId) ?? [])
      .sort(),
    [
      '2117092005188878390',
      '2116712563430060542',
      '2117071860672143746',
      '2117052664475263042',
      '2117056008900014458',
      '2117052480076837082',
    ].sort(),
  );
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.hoopsrumors.com'),
  );
  assert.ok(items.every((item) => item.excerpt.length <= 1500 && item.author));
  assert.doesNotMatch(items[0].excerpt, /<[^>]+>|&#\d+;/);
});
void test('recorded Nintendo Life feed preserves release news and plain excerpts', async () => {
  const items = parseFeed(await fixture('nintendo-life.xml'));
  assert.equal(
    items[0].title,
    "HoYoverse Announces Cosy Galactic Life Sim 'Petit Planet' For Switch 2",
  );
  assert.equal(items[0].publishedAt, '2026-11-02T03:30:00.000Z');
  assert.match(items[0].excerpt, /2027/);
  assert.ok(
    items.every(
      (item) => new URL(item.url).hostname === 'www.nintendolife.com',
    ),
  );
  assert.doesNotMatch(items[0].excerpt, /<[^>]+>|&#\d+;/);
  assert.equal(items[0].xLinks?.length, 0);
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
      xLinks: [
        {
          externalId: '123456789',
          url: 'https://twitter.com/reporter/status/123456789?s=20',
        },
      ],
      engagement: { points: 42 },
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
    const citations = await repository.db.query(
      'SELECT external_id,canonical_url,citing_engagement FROM x_link_citations WHERE source_id=$1',
      [id],
    );
    assert.equal(citations.rowCount, 1);
    assert.equal(citations.rows[0].external_id, '123456789');
    assert.equal(
      citations.rows[0].canonical_url,
      'https://x.com/i/web/status/123456789',
    );
    assert.deepEqual(citations.rows[0].citing_engagement, { points: 42 });
    const readPublisher = async () =>
      (
        await repository.db.query(
          'SELECT publisher FROM content_items WHERE canonical_url=$1',
          [item.url],
        )
      ).rows[0].publisher;
    assert.equal(await readPublisher(), null);
    const publisher = { name: 'Reuters', url: 'https://www.reuters.com/' };
    await repository.store(source, [{ ...item, publisher }]);
    assert.deepEqual(await readPublisher(), publisher);
    // A title-only or direct feed observing the same URL must not erase evidence.
    await repository.store(source, [item]);
    assert.deepEqual(await readPublisher(), publisher);
    const updatedPublisher = { name: 'Reuters', url: null };
    await repository.store(source, [{ ...item, publisher: updatedPublisher }]);
    assert.deepEqual(await readPublisher(), updatedPublisher);
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

void test('recorded Gematsu RSS preserves release reporting and has no inferred X citations', async () => {
  const items = parseFeed(await fixture('gematsu.xml'));
  assert.equal(items[0].title, 'Nagoshi Studio shuts down');
  assert.equal(items[0].publishedAt, '2026-11-02T03:16:59.000Z');
  assert.equal(
    items[1].title,
    'Phantom Blade Zero sales top four million in 72 hours',
  );
  assert.equal(items[1].publishedAt, '2026-11-02T02:59:03.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.gematsu.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Kotaku feed preserves dates without inventing page citations', async () => {
  const items = parseFeed(await fixture('kotaku.xml'));
  assert.equal(
    items[1].title,
    'Team Behind Fan-Made Oblivion Remake Face Lawsuit From Former Contributor',
  );
  assert.equal(items[1].publishedAt, '2026-11-01T21:19:05.000Z');
  assert.ok(items.every((item) => new URL(item.url).hostname === 'kotaku.com'));
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Guardian US feed preserves US reporting without inferring page citations', async () => {
  const items = parseFeed(await fixture('guardian-us.xml'));
  assert.equal(items.length, 2);
  assert.match(items[0].title, /Haley Stevens/);
  assert.equal(items[0].publishedAt, '2026-11-02T11:06:26.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T11:00:41.000Z');
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'www.theguardian.com'),
  );
  assert.ok(
    items.every(
      (item) => item.excerpt.length > 0 && item.excerpt.length <= 1500,
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Insider Gaming feed retains reporting dates and leaves page citations unknown', async () => {
  const items = parseFeed(await fixture('insider-gaming.xml'));
  assert.equal(items.length, 3);
  assert.match(items[0].title, /PS5 Firmware Update/);
  assert.equal(items[0].publishedAt, '2026-11-02T10:58:42.000Z');
  assert.match(items[2].title, /Phantom Blade Zero/);
  assert.ok(
    items.every((item) => new URL(item.url).hostname === 'insider-gaming.com'),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded RealGM feed retains NBA reporting, EST dates and excerpts without invented citations', async () => {
  const items = parseFeed(await fixture('realgm.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Dalen Terry, Thunder Agree To Two-Year Contract',
  );
  assert.equal(items[0].publishedAt, '2026-11-03T14:06:43.000Z');
  assert.equal(items[1].publishedAt, '2026-11-02T21:36:41.000Z');
  assert.equal(
    items[0].imageUrl,
    'https://basketball.realgm.com/images/nba/4.2/wiretap/photos/2006/Terry_Dalen_chi_221114.jpg',
  );
  assert.ok(items[0].excerpt?.includes('two-year contract'));
  assert.ok(items[1].excerpt?.includes('Wembanyama'));
  assert.ok(
    items.every(
      (item) => new URL(item.url).hostname === 'basketball.realgm.com',
    ),
  );
  assert.ok(items.every((item) => !item.excerpt?.includes('<p>')));
  assert.ok(items.every((item) => item.author === null));
  assert.ok(items.every((item) => item.xLinks?.length === 0));
});

void test('recorded SB Nation NBA Atom preserves dates, authors and embedded highlight citations', async () => {
  const items = parseFeed(await fixture('sbnation-nba.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Draymond Green tackles opponent, brawls with another for 26th career ejection',
  );
  assert.equal(items[0].publishedAt, '2026-11-03T15:11:29.000Z');
  assert.equal(items[1].publishedAt, '2026-11-03T13:00:00.000Z');
  assert.deepEqual(
    items.map((item) => item.author),
    ['James Dator', "Ricky O'Donnell"],
  );
  assert.deepEqual(
    items.map((item) => item.xLinks),
    [
      [
        {
          externalId: '2117481817821286446',
          verificationUrl:
            'https://twitter.com/ESPNNBA/status/2117481817821286446',
          url: 'https://x.com/i/web/status/2117481817821286446',
        },
      ],
      [
        {
          externalId: '2117106779997753358',
          verificationUrl: 'https://twitter.com/NBA/status/2117106779997753358',
          url: 'https://x.com/i/web/status/2117106779997753358',
        },
      ],
    ],
  );
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.sbnation.com' &&
        new URL(item.url).pathname.startsWith('/nba/'),
    ),
  );
  assert.ok(items[0].excerpt.includes('double technical'));
  assert.ok(
    items.every(
      (item) =>
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500 &&
        !item.excerpt.includes('<p>'),
    ),
  );
  assert.ok(items.every((item) => item.imageUrl === null));
});

void test('recorded Basketball Insiders feed preserves authored game reporting and UTC dates', async () => {
  const items = parseFeed(await fixture('basketball-insiders.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Gilgeous-Alexander’s 43 points and late 3 hand Cavaliers their first home loss',
  );
  assert.deepEqual(
    items.map((item) => item.publishedAt),
    ['2026-11-03T12:18:28.000Z', '2026-11-03T09:57:57.000Z'],
  );
  assert.ok(
    items.every((item) => item.author === 'Basketball Insiders Editor'),
  );
  assert.ok(items[0].excerpt.includes('117-112'));
  assert.ok(items[1].excerpt.includes('Golden State'));
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.basketballinsiders.com' &&
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500 &&
        !item.excerpt.includes('<p>'),
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('recorded Yardbarker NBA feed preserves bylines, offset dates and syndicated links', async () => {
  const items = parseFeed(await fixture('yardbarker-nba.xml'));
  assert.equal(items.length, 2);
  assert.equal(
    items[0].title,
    'Zero doubt: Russell Westbrook feted by Thunder after legendary 18-year career',
  );
  assert.deepEqual(
    items.map((item) => item.author),
    ['Andrew Wright, Yardbarker', 'Ty Bronicel, Yardbarker'],
  );
  assert.deepEqual(
    items.map((item) => item.publishedAt),
    ['2026-11-02T22:00:38.000Z', '2026-11-02T17:36:18.000Z'],
  );
  assert.ok(items[0].excerpt.includes('Oklahoma City'));
  assert.ok(
    items.every(
      (item) =>
        new URL(item.url).hostname === 'www.yardbarker.com' &&
        new URL(item.url).pathname.startsWith('/nba/articles/') &&
        item.excerpt.length > 0 &&
        item.excerpt.length <= 1500,
    ),
  );
  assert.ok(
    items.every((item) =>
      item.imageUrl?.startsWith('http://www.yardbarker.com/media/'),
    ),
  );
  assert.ok(items.every((item) => item.xLinks.length === 0));
});

void test('feed excerpts fall back to bounded body text only when summaries are blank', () => {
  const item = (fields: string) =>
    parseFeed(`<rss><channel><item>
    <title>Synthetic feed fallback</title><link>https://example.com/article</link>
    <pubDate>Fri, 06 Nov 2026 12:00:00 GMT</pubDate>${fields}
    </item></channel></rss>`)[0];
  assert.equal(
    item(
      '<description>Publisher summary</description><content:encoded>Long body</content:encoded>',
    ).excerpt,
    'Publisher summary',
  );
  assert.equal(
    item(
      '<description> </description><summary>Alternative summary</summary><content:encoded>Long body</content:encoded>',
    ).excerpt,
    'Alternative summary',
  );
  assert.equal(
    item(
      '<description><![CDATA[<p> </p>]]></description><content:encoded><![CDATA[<p>Body &amp; context</p>]]></content:encoded>',
    ).excerpt,
    'Body & context',
  );
  const atom = parseFeed(
    `<feed><entry><title>Synthetic Atom</title><link href="https://example.com/atom"/><updated>2026-11-06T12:00:00Z</updated><content type="html">&lt;p&gt;${'x'.repeat(1800)}&lt;/p&gt;</content></entry></feed>`,
  )[0];
  assert.equal(atom.excerpt, 'x'.repeat(1500));
  assert.equal(item('').excerpt, '');
});
