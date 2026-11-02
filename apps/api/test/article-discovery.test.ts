import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { RiverDiscovery } from '../src/modules/social/adapters/river-discovery';
import { collectArticleLinks } from '../src/modules/social/application/collect-article-links';
import { PostgresArticleDiscoveryRepository } from '../src/modules/social/database/article-discovery.repository';
import type {
  ArticleDiscoveryRepository,
  DiscoveryArticle,
} from '../src/modules/social/domain/article-discovery.port';

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
  const quietSource = `${source}-quiet`;
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
    // One busy publisher must not crowd out another publisher in the same topic.
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host)
       VALUES($1,$2,'Quiet fixture','feed','https://quiet.example.org/feed','quiet.example.org')`,
      [quietSource, topic],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topic, quietSource],
    );
    for (let n = 0; n < 10; n++) {
      const quiet = n === 9;
      const item = await repository.db.query<{ id: string }>(
        `INSERT INTO content_items(canonical_url,title,excerpt,published_at)
         VALUES($1,'Fixture','Fixture',now()-$2::interval) RETURNING id`,
        [
          `https://${quiet ? 'quiet.example.org' : 'example.org'}/rotation-${n}`,
          quiet ? '2 days' : '30 minutes',
        ],
      );
      ids.push(item.rows[0].id);
      await repository.db.query(
        'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
        [item.rows[0].id, quiet ? quietSource : source],
      );
    }
    const rotated = await repository.candidates();
    assert.equal(rotated.length, 8);
    assert.equal(rotated[1].host, 'quiet.example.org');
    // A failed page cools down the whole exact host across subsequent passes.
    await repository.record(a, null);
    const cooled = await repository.candidates();
    assert.equal(cooled.length, 1);
    assert.equal(cooled[0].host, 'quiet.example.org');
    await repository.db.query(
      "UPDATE article_x_discovery_checks SET checked_at=now()-interval '25 hours' WHERE item_id=$1",
      [a.id],
    );
    assert.equal((await repository.candidates()).length, 8);
    await repository.record(a, []);
    assert.equal((await repository.candidates()).length, 8);

    assert.equal(new Set(rotated.map((item) => item.id)).size, 8);
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.deepEqual(await repository.candidates(), []);
  } finally {
    await repository.db.query(
      'DELETE FROM x_link_citations WHERE source_id=ANY($1::text[])',
      [[source, quietSource]],
    );
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=ANY($1::text[])',
      [[source, quietSource]],
    );
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=ANY($1::text[])',
      [[source, quietSource]],
    );
    await repository.db.query(
      'DELETE FROM content_sources WHERE id=ANY($1::text[])',
      [[source, quietSource]],
    );
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

void test('publisher persistence rechecks shared-topic configuration and rolls back citation updates when the final check fails', async () => {
  const repository = new PostgresArticleDiscoveryRepository();
  const topic = crypto.randomUUID();
  const sharedTopic = crypto.randomUUID();
  const source = `publisher-${topic}`;
  const host = `${topic}.example.org`;
  let article: DiscoveryArticle | undefined;
  const link = (id: string, handle = 'original') => ({
    externalId: id,
    url: `https://x.com/${handle}/status/${id}`,
  });
  const citations = async () =>
    (
      await repository.db.query(
        `SELECT external_id,verification_url,citing_engagement,first_seen_at,last_seen_at
       FROM x_link_citations WHERE item_id=$1 ORDER BY external_id`,
        [article!.id],
      )
    ).rows;
  const check = async () =>
    (
      await repository.db.query(
        'SELECT checked_at,last_error,link_count FROM article_x_discovery_checks WHERE item_id=$1',
        [article!.id],
      )
    ).rows[0];
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       SELECT fixture.id,p.id,'Publisher fixture','','',100
       FROM profiles p CROSS JOIN unnest($1::uuid[]) fixture(id) LIMIT 2`,
      [[topic, sharedTopic]],
    );
    await repository.db.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host)
       VALUES($1,$2,'Publisher fixture','feed',$3,$4)`,
      [source, topic, `https://${host}/feed`, host],
    );
    await repository.db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$3),($2,$3)',
      [topic, sharedTopic, source],
    );
    const item = await repository.db.query<{ id: string }>(
      `INSERT INTO content_items(canonical_url,title,excerpt,published_at,engagement)
       VALUES($1,'Publisher fixture','',now()-interval '1 hour','{"points":42,"comments":7}') RETURNING id`,
      [`https://${host}/story`],
    );
    article = { id: item.rows[0].id, host, url: `https://${host}/story` };
    await repository.db.query(
      'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
      [article.id, source],
    );
    const candidates = async () =>
      (await repository.candidates()).filter((a) => a.host === host);
    assert.deepEqual(await candidates(), [article]); // two connected topics, one fetch
    await repository.record(article, [link('999400000000000001')]);
    const before = await citations();
    assert.deepEqual(before[0].citing_engagement, { points: 42, comments: 7 });
    const beforeCheck = await check();
    // Fault injection at the final write proves earlier INSERT/UPDATE work is atomic.
    await repository.db.query(
      `ALTER TABLE article_x_discovery_checks ADD CONSTRAINT publisher_fixture_failure
       CHECK (item_id <> '${article.id}'::uuid OR link_count <> 2) NOT VALID`,
    );
    try {
      await assert.rejects(
        repository.record(article, [
          link('999400000000000001', 'updated'),
          link('999400000000000002'),
        ]),
        /publisher_fixture_failure/,
      );
      assert.deepEqual(await citations(), before);
      assert.deepEqual(await check(), beforeCheck);
    } finally {
      await repository.db.query(
        'ALTER TABLE article_x_discovery_checks DROP CONSTRAINT publisher_fixture_failure',
      );
    }
    await repository.record(article, [link('999400000000000001', 'updated')]);
    assert.equal(
      (await citations())[0].verification_url,
      'https://twitter.com/updated/status/999400000000000001',
    );
    assert.deepEqual(
      (await citations())[0].first_seen_at,
      before[0].first_seen_at,
    );

    await repository.db.query(
      'DELETE FROM article_x_discovery_checks WHERE item_id=$1',
      [article.id],
    );
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.deepEqual(await candidates(), [article]); // remaining enabled connection
    await repository.db.query('DELETE FROM topics WHERE id=$1', [sharedTopic]);
    assert.deepEqual(await candidates(), []);
    await repository.record(article, [link('999400000000000003')]);
    assert.equal((await citations()).length, 1); // stale candidate cannot add citations
    assert.equal((await check()).link_count, 1); // check counts parsed links, not inserts
    await repository.db.query('UPDATE topics SET enabled=true WHERE id=$1', [
      topic,
    ]);
    await repository.db.query(
      'UPDATE content_sources SET article_discovery_host=NULL WHERE id=$1',
      [source],
    );
    await repository.record(article, [link('999400000000000004')]);
    assert.equal((await citations()).length, 1);
    await repository.db.query(
      'DELETE FROM article_x_discovery_checks WHERE item_id=$1',
      [article.id],
    );
    assert.deepEqual(await candidates(), []);
  } finally {
    await repository.db.query(
      'DELETE FROM content_observations WHERE source_id=$1',
      [source],
    );
    await repository.db.query('DELETE FROM content_items WHERE id=$1', [
      article?.id,
    ]);
    await repository.db.query(
      'DELETE FROM topic_source_connections WHERE source_id=$1',
      [source],
    );
    await repository.db.query('DELETE FROM content_sources WHERE id=$1', [
      source,
    ]);
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      [topic, sharedTopic],
    ]);
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

void test('recorded Kotaku speedrun embed preserves named X citation without fetching X', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/kotaku-article-x.html',
    'utf8',
  );
  const pages = new RiverDiscovery({ get: async () => html });
  assert.deepEqual(await pages.collect('https://kotaku.com/recorded'), [
    {
      externalId: '2116763103912161559',
      url: 'https://x.com/i/web/status/2116763103912161559',
      verificationUrl:
        'https://twitter.com/acid4096dx/status/2116763103912161559',
    },
  ]);
});

void test('recorded Guardian US article links preserve four named X citations without fetching X', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/guardian-us-article-x.html',
    'utf8',
  );
  const pages = new RiverDiscovery({ get: async () => html });
  assert.deepEqual(
    await pages.collect('https://www.theguardian.com/us-news/recorded'),
    [
      ['2waytvapp', '2117033676525412562'],
      ['chuckschumer', '2116969707425468536'],
      ['BernieSanders', '2117003682382229741'],
      ['ZohranKMamdani', '2116987903419338975'],
    ].map(([handle, externalId]) => ({
      externalId,
      url: `https://x.com/i/web/status/${externalId}`,
      verificationUrl: `https://twitter.com/${handle}/status/${externalId}`,
    })),
  );
});

void test('recorded Insider Gaming article preserves named firmware citation', async () => {
  const html = await readFile(
    'apps/api/test/fixtures/insider-gaming-article-x.html',
    'utf8',
  );
  const pages = new RiverDiscovery({ get: async () => html });
  assert.deepEqual(await pages.collect('https://insider-gaming.com/recorded'), [
    {
      externalId: '2117174273852792952',
      url: 'https://x.com/i/web/status/2117174273852792952',
      verificationUrl:
        'https://twitter.com/PlaystationSize/status/2117174273852792952',
    },
  ]);
});

void test('publisher candidate limit preserves publisher diversity, topic position and tied ID ordering', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const adapter = new PostgresArticleDiscoveryRepository();
  const repository: ArticleDiscoveryRepository = adapter;
  const db = adapter.db;
  const enabled = (
    await db.query<{ id: string }>('SELECT id FROM topics WHERE enabled')
  ).rows.map((row) => row.id);
  const topics = [randomUUID(), randomUUID()];
  const sources = topics.map((id) => `fairness-${id}`);
  const items: DiscoveryArticle[][] = [[], []];
  try {
    await db.query('UPDATE topics SET enabled=false');
    for (let t = 0; t < 2; t++) {
      await db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        VALUES($1,'00000000-0000-4000-8000-000000000001','Fairness fixture','','',$2)`,
        [topics[t], 100 + t],
      );
      await db.query(
        `INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host)
        VALUES($1,$2,'Fairness fixture','feed',$3,$4)`,
        [
          sources[t],
          topics[t],
          `https://fairness-${t}.example/feed`,
          `fairness-${t}.example`,
        ],
      );
      await db.query(
        'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
        [topics[t], sources[t]],
      );
      for (let i = 0; i < 6; i++) {
        const article = {
          id: randomUUID(),
          url: `https://fairness-${t}.example/${i}`,
          host: `fairness-${t}.example`,
        };
        items[t].push(article);
        await db.query(
          `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
          VALUES($1,$2,'Fairness fixture','',now()-interval '1 hour')`,
          [article.id, article.url],
        );
        await db.query(
          'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
          [article.id, sources[t]],
        );
      }
    }
    // Equal timestamps leave UUID as the publisher-local tie breaker.
    await db.query(
      `UPDATE content_items SET published_at=now()-interval '1 hour' WHERE id=ANY($1::uuid[])`,
      [items.flat().map((a) => a.id)],
    );
    items.forEach((group) => group.sort((a, b) => a.id.localeCompare(b.id)));
    const interleave = () =>
      items[0].flatMap((a, i) => [a, items[1][i]]).slice(0, 8);
    assert.deepEqual(await repository.candidates(), interleave());
    // Sharing a publisher with both topics must not consume duplicate fetch slots.
    await db.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topics[1], sources[0]],
    );
    const shared = await repository.candidates();
    assert.equal(shared.length, 8);
    assert.equal(new Set(shared.map((a) => a.id)).size, 8);
    for (const group of items)
      assert.ok(shared.some((article) => article.id === group[0].id));
    await db.query(
      'DELETE FROM topic_source_connections WHERE topic_id=$1 AND source_id=$2',
      [topics[1], sources[0]],
    );
    await db.query('UPDATE topics SET position=99 WHERE id=$1', [topics[1]]);
    const reordered = await repository.candidates();
    assert.deepEqual(
      reordered,
      items[1].flatMap((a, i) => [a, items[0][i]]).slice(0, 8),
    );
    // A recently failed article suppresses the whole opted-in host, leaving the other publisher.
    await repository.record(items[1][0], null);
    assert.deepEqual(await repository.candidates(), items[0]);
    await db.query(
      `UPDATE article_x_discovery_checks SET checked_at=now()-interval '25 hours' WHERE item_id=$1`,
      [items[1][0].id],
    );
    assert.deepEqual(await repository.candidates(), reordered);
  } finally {
    await db.query(
      'DELETE FROM content_observations WHERE source_id=ANY($1::text[])',
      [sources],
    );
    await db.query('DELETE FROM content_items WHERE id=ANY($1::uuid[])', [
      items.flat().map((a) => a.id),
    ]);
    await db.query(
      'DELETE FROM topic_source_connections WHERE source_id=ANY($1::text[])',
      [sources],
    );
    await db.query('DELETE FROM content_sources WHERE id=ANY($1::text[])', [
      sources,
    ]);
    await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [topics]);
    await db.query('UPDATE topics SET enabled=true WHERE id=ANY($1::uuid[])', [
      enabled,
    ]);
    await db.end();
  }
});

void test('publisher admission pins millisecond publication and cooldown boundaries in a non-UTC session', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresArticleDiscoveryRepository();
  const pool = repository.db;
  const client = await pool.connect();
  Object.defineProperty(repository, 'db', { value: client });
  const topic = randomUUID();
  const source = `boundary-${topic}`;
  const host = `${topic}.example.org`;
  const article: DiscoveryArticle = {
    id: randomUUID(),
    url: `https://${host}/story`,
    host,
  };
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'Pacific/Auckland'");
    await client.query('UPDATE topics SET enabled=false');
    await client.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      SELECT $1,id,'Boundary fixture','','',100 FROM profiles LIMIT 1`,
      [topic],
    );
    await client.query(
      `INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host)
      VALUES($1,$2,'Boundary fixture','feed',$3,$4)`,
      [source, topic, `https://${host}/feed`, host],
    );
    await client.query(
      'INSERT INTO topic_source_connections(topic_id,source_id) VALUES($1,$2)',
      [topic, source],
    );
    await client.query(
      `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
      VALUES($1,$2,'Boundary fixture','',now())`,
      [article.id, article.url],
    );
    await client.query(
      'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
      [article.id, source],
    );
    for (const [offset, eligible] of [
      ['-3 days', true],
      ['-3 days -1 millisecond', false],
      ['0 seconds', true],
      ['1 millisecond', false],
    ] as const) {
      await client.query(
        'UPDATE content_items SET published_at=now()+$2::interval WHERE id=$1',
        [article.id, offset],
      );
      assert.deepEqual(
        await repository.candidates(),
        eligible ? [article] : [],
        offset,
      );
    }
    await client.query(
      "UPDATE content_items SET published_at=now()-interval '1 hour' WHERE id=$1",
      [article.id],
    );
    await client.query(
      'INSERT INTO article_x_discovery_checks(item_id,link_count) VALUES($1,0)',
      [article.id],
    );
    for (const [error, age, eligible] of [
      [null, '7 days', false],
      [null, '7 days 1 millisecond', true],
      ['Unavailable', '1 day', false],
      ['Unavailable', '1 day 1 millisecond', true],
      ['Unavailable', '23 hours 59 minutes 59.999 seconds', false],
      [null, '-1 millisecond', false],
    ] as const) {
      await client.query(
        'UPDATE article_x_discovery_checks SET last_error=$2,checked_at=now()-$3::interval WHERE item_id=$1',
        [article.id, error, age],
      );
      assert.deepEqual(
        await repository.candidates(),
        eligible ? [article] : [],
        `${error}: ${age}`,
      );
    }
    // An exact-day host failure no longer blocks sibling articles, even though
    // the failed article itself requires strictly more than a day before retry.
    await client.query(
      "UPDATE article_x_discovery_checks SET last_error='Unavailable',checked_at=now()-interval '1 day' WHERE item_id=$1",
      [article.id],
    );
    const sibling = {
      ...article,
      id: randomUUID(),
      url: `https://${host}/sibling`,
    };
    await client.query(
      `INSERT INTO content_items(id,canonical_url,title,excerpt,published_at)
      VALUES($1,$2,'Sibling fixture','',now())`,
      [sibling.id, sibling.url],
    );
    await client.query(
      'INSERT INTO content_observations(item_id,source_id) VALUES($1,$2)',
      [sibling.id, source],
    );
    assert.deepEqual(await repository.candidates(), [sibling]);
    await client.query(
      "UPDATE article_x_discovery_checks SET checked_at=checked_at+interval '1 millisecond' WHERE item_id=$1",
      [article.id],
    );
    assert.deepEqual(await repository.candidates(), []);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
