import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';

void test('bounded verification shares slots across enabled topics, dedupes shared posts and defers refreshes', async () => {
  const repository = new PostgresSocialRepository();
  const topics = Array.from({ length: 4 }, () => crypto.randomUUID());
  const enabled = await repository.db.query<{ id: string }>(
    'SELECT id FROM topics WHERE enabled',
  );
  const ids = Array.from(
    { length: 20 },
    (_, i) => `9992000000000000${String(i).padStart(2, '0')}`,
  );
  const sources = topics.map((_, i) => `candidate-fixture-${i}`);
  try {
    await repository.db.query('UPDATE topics SET enabled=false');
    for (const [i, topic] of topics.entries()) {
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',$2)`,
        [topic, i + 100],
      );
      await repository.db.query(
        `INSERT INTO social_discovery_sources(id,topic_id,name,url) VALUES($1,$2,'Fixture',$3)`,
        [sources[i], topic, `https://example.org/candidates/${i}`],
      );
      await repository.discovered(
        sources[i],
        (i === 0 ? ids.slice(0, 16) : [ids[15 + i]]).map((externalId) => ({
          externalId,
          url: `https://x.com/fixture/status/${externalId}`,
        })),
      );
    }
    // One post is cited in two topics, yet consumes only one request.
    await repository.discovered(sources[1], [
      { externalId: ids[15], url: `https://x.com/fixture/status/${ids[15]}` },
    ]);
    await repository.store({
      platform: 'x',
      externalId: ids[18],
      url: `https://x.com/fixture/status/${ids[18]}`,
      author: 'Fixture',
      authorUrl: 'https://x.com/fixture',
      publishedAt: null,
      metrics: {},
      embedHtml: '<p>Fixture</p>',
    });
    const first = await repository.candidates(4);
    assert.equal(first.length, 4);
    assert.equal(new Set(first).size, 4);
    assert.ok(first.includes(ids[17])); // quiet third topic receives a slot
    assert.ok(first.includes(ids[16])); // second topic, even with shared post
    assert.ok(!first.includes(ids[18])); // verified fourth-topic post waits
    assert.equal((await repository.candidates(50)).at(-1), ids[18]);
    await repository.checked(ids[17], 'Unavailable');
    assert.ok(!(await repository.candidates(50)).includes(ids[17]));
    await repository.db.query(
      "UPDATE x_embed_checks SET checked_at=now()-interval '2 days' WHERE external_id=$1",
      [ids[17]],
    );
    assert.ok((await repository.candidates(50)).includes(ids[17]));
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topics[2],
    ]);
    assert.ok(!(await repository.candidates(50)).includes(ids[17]));
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topics[1]]);
    assert.ok(!(await repository.candidates(50)).includes(ids[16]));
  } finally {
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=ANY($1::text[])',
      [sources],
    );
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topics,
    ]);
    await repository.db.query(
      'UPDATE topics SET enabled=true WHERE id=ANY($1::uuid[])',
      [enabled.rows.map((row) => row.id)],
    );
    await repository.db.query(
      'DELETE FROM social_posts WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await repository.db.query(
      'DELETE FROM x_embed_checks WHERE external_id=ANY($1::text[])',
      [ids],
    );
    await repository.db.end();
  }
});

void test('verified post refresh preserves discovery fields and rejects invalid JSON atomically', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const id = '2116948532477468659';
  const post = {
    platform: 'x' as const,
    externalId: id,
    url: `https://x.com/original/status/${id}`,
    author: 'Original author',
    authorUrl: 'https://x.com/original',
    publishedAt: '2026-10-21T14:30:00.123+05:30',
    metrics: { likes: 42, views: 1234 },
    embedHtml: '<blockquote>Original fixture</blockquote>',
  };
  // There is no public post-detail reader; inspect persisted values, not SQL text.
  const read = async () =>
    (
      await repository.db.query(
        `SELECT canonical_url,author,author_url,published_at,metrics,embed_html,verified_at
     FROM social_posts WHERE platform='x' AND external_id=$1`,
        [id],
      )
    ).rows[0];
  try {
    await repository.store(post);
    const inserted = await read();
    assert.equal(inserted.canonical_url, post.url);
    assert.equal(inserted.author, post.author);
    assert.equal(inserted.author_url, post.authorUrl);
    assert.equal(
      inserted.published_at.toISOString(),
      '2026-10-21T09:00:00.123Z',
    );
    assert.deepEqual(inserted.metrics, post.metrics);
    assert.equal(inserted.embed_html, post.embedHtml);
    await repository.db.query(
      "UPDATE social_posts SET verified_at='2000-01-01T00:00:00Z' WHERE platform='x' AND external_id=$1",
      [id],
    );
    const refresh = {
      ...post,
      url: `https://x.com/renamed/status/${id}`,
      author: 'Renamed — 選手',
      authorUrl: 'https://x.com/renamed',
      publishedAt: null,
      metrics: { likes: 999 },
      embedHtml: '<blockquote>Refreshed fixture</blockquote>',
    };
    await repository.store(refresh);
    const refreshed = await read();
    assert.deepEqual(
      { ...refreshed, verified_at: inserted.verified_at },
      {
        ...inserted,
        author: refresh.author,
        author_url: refresh.authorUrl,
        embed_html: refresh.embedHtml,
      },
    );
    assert.ok(refreshed.verified_at > new Date('2000-01-01T00:00:00Z'));
    // A PostgreSQL-rejected field must not partially refresh author, embed or time.
    await assert.rejects(
      repository.store({
        ...refresh,
        author: 'Must not persist',
        embedHtml: 'Must not persist',
        publishedAt: '2026-10-22T00:00:00Z',
        metrics: { ['invalid\u0000key']: 1 },
      }),
    );
    assert.deepEqual(await read(), refreshed);
    await repository.store({
      ...refresh,
      publishedAt: '2026-10-22T02:00:00.456+02:00',
    });
    const recovered = await read();
    assert.equal(
      recovered.published_at.toISOString(),
      '2026-10-22T00:00:00.456Z',
    );
    assert.equal(recovered.canonical_url, post.url);
    assert.deepEqual(recovered.metrics, post.metrics);
    assert.equal(
      (
        await repository.db.query(
          "SELECT count(*)::int AS count FROM social_posts WHERE platform='x' AND external_id=$1",
          [id],
        )
      ).rows[0].count,
      1,
    );
  } finally {
    await repository.db.query(
      "DELETE FROM social_posts WHERE platform='x' AND external_id=$1",
      [id],
    );
    await repository.db.end();
  }
});

void test('embed checks pin daily retry boundaries and recover without losing prior state', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const pool = repository.db;
  const client = await pool.connect();
  Object.defineProperty(repository, 'db', { value: client });
  const topic = crypto.randomUUID();
  const source = 'embed-check-boundary-fixture';
  const id = '2116948532477468660';
  const read = async () =>
    (
      await client.query('SELECT * FROM x_embed_checks WHERE external_id=$1', [
        id,
      ])
    ).rows[0];
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'America/Los_Angeles'");
    await client.query('UPDATE topics SET enabled=false');
    await client.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',100)`,
      [topic],
    );
    await client.query(
      `INSERT INTO social_discovery_sources(id,topic_id,name,url)
      VALUES($1,$2,'Fixture','https://example.org/embed-check-fixture')`,
      [source, topic],
    );
    await client.query(
      'INSERT INTO social_discovery_citations(source_id,external_id,canonical_url) VALUES($1,$2,$3)',
      [source, id, `https://x.com/fixture/status/${id}`],
    );
    assert.deepEqual(await repository.candidates(50), [id]);
    await repository.checked(id, 'Official embed unavailable — 試験');
    const failed = await read();
    assert.equal(failed.error, 'Official embed unavailable — 試験');
    assert.deepEqual(await repository.candidates(50), []);
    for (const [offset, expected] of [
      [1, []],
      [0, []],
      [-1, [id]],
    ] as const) {
      await client.query(
        `UPDATE x_embed_checks SET checked_at=now()-interval '1 day'+$2*interval '1 millisecond'
        WHERE external_id=$1`,
        [id, offset],
      );
      assert.deepEqual(await repository.candidates(50), expected);
    }
    const stale = await read();
    await client.query('SAVEPOINT invalid_check');
    await assert.rejects(repository.checked(id, 'invalid\u0000diagnostic'));
    await client.query('ROLLBACK TO SAVEPOINT invalid_check');
    assert.deepEqual(await read(), stale);
    assert.deepEqual(await repository.candidates(50), [id]);
    await repository.checked(id, null);
    const recovered = await read();
    assert.equal(recovered.error, null);
    assert.ok(recovered.checked_at > stale.checked_at);
    assert.deepEqual(await repository.candidates(50), []);
    await repository.checked(id, 'Later failure');
    assert.equal((await read()).error, 'Later failure');
    assert.equal(
      (
        await client.query(
          'SELECT count(*)::int AS count FROM x_embed_checks WHERE external_id=$1',
          [id],
        )
      ).rows[0].count,
      1,
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});

void test('missing X publication times backfill only valid verified posts and preserve existing evidence', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const pool = repository.db;
  const client = await pool.connect();
  Object.defineProperty(repository, 'db', { value: client });
  const now = new Date('2026-10-20T12:34:56.789Z');
  const snowflake = (time: number) =>
    ((BigInt(time) - 1288834974657n) << 22n).toString();
  const current = snowflake(now.getTime());
  const future = snowflake(now.getTime() + 1);
  const dated = snowflake(now.getTime() - 1000);
  const invalid = ['1', '12345', '9223372036854775808'];
  const read = async () =>
    (
      await client.query(
        'SELECT * FROM social_posts ORDER BY platform,external_id',
      )
    ).rows;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL TIME ZONE 'Asia/Tokyo'");
    // Isolate the global backfill from other test fixtures; rollback restores them.
    await client.query('DELETE FROM social_posts');
    for (const externalId of [current, future, dated, ...invalid]) {
      await repository.store({
        platform: 'x',
        externalId,
        url: `https://x.com/fixture/status/${externalId}`,
        author: 'Fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt: externalId === dated ? '2026-10-19T01:02:03.456Z' : null,
        metrics: { likes: 17 },
        embedHtml: '<p>Verified fixture</p>',
      });
    }
    await client.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,metrics,embed_html,reddit_metadata)
      VALUES('reddit',$1,'https://example.org/fixture','Fixture','https://example.org','{}','<p>Fixture</p>','{}')`,
      [current],
    );
    const before = await read();
    assert.equal(await repository.refreshMissingTimes(now), 1);
    const after = await read();
    assert.deepEqual(
      after,
      before.map((row) =>
        row.platform === 'x' && row.external_id === current
          ? { ...row, published_at: now }
          : row,
      ),
    );
    assert.equal(await repository.refreshMissingTimes(now), 0);
    assert.deepEqual(await read(), after);
    assert.equal(
      await repository.refreshMissingTimes(new Date(now.getTime() + 1)),
      1,
    );
    assert.deepEqual(
      await read(),
      after.map((row) =>
        row.platform === 'x' && row.external_id === future
          ? { ...row, published_at: new Date(now.getTime() + 1) }
          : row,
      ),
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});

void test('river discovery rolls back its final status write and retries without duplicates', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const topic = crypto.randomUUID();
  const source = `river-rollback-${topic}`;
  const original = {
    externalId: '2116948532477468660',
    url: 'https://x.com/fixture/status/2116948532477468660',
    verificationUrl: 'https://example.org/original',
  };
  const added = {
    externalId: '2116948532477468661',
    url: 'https://x.com/fixture/status/2116948532477468661',
    verificationUrl: 'https://example.org/added',
  };
  const read = async () => ({
    source: (
      await repository.db.query(
        'SELECT * FROM social_discovery_sources WHERE id=$1',
        [source],
      )
    ).rows,
    citations: (
      await repository.db.query(
        'SELECT * FROM social_discovery_citations WHERE source_id=$1 ORDER BY external_id',
        [source],
      )
    ).rows,
  });
  try {
    await repository.db.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
      VALUES($1,'00000000-0000-4000-8000-000000000001','River rollback','Fixture','Fixture',900)`,
      [topic],
    );
    await repository.db.query(
      `INSERT INTO social_discovery_sources(id,topic_id,name,url)
      VALUES($1,$2,'Fixture','https://example.org/rollback')`,
      [source, topic],
    );
    await repository.discovered(source, [original]);
    await repository.discoveryFailed(source);
    const before = await read();
    // Reject the final source-health write after every citation upsert succeeded.
    await repository.db
      .query(`ALTER TABLE social_discovery_sources ADD CONSTRAINT river_final_status_fixture
      CHECK (id <> '${source}' OR last_link_count <> 2)`);
    await assert.rejects(
      repository.discovered(source, [
        { ...original, verificationUrl: 'https://example.org/replacement' },
        added,
      ]),
      /river_final_status_fixture/,
    );
    assert.deepEqual(await read(), before);
    assert.equal(
      await repository.verificationUrl(original.externalId),
      original.verificationUrl,
    );
    assert.equal(await repository.verificationUrl(added.externalId), undefined);
    await repository.db.query(
      'ALTER TABLE social_discovery_sources DROP CONSTRAINT river_final_status_fixture',
    );
    await repository.discovered(source, [original, added]);
    const recovered = await read();
    assert.equal(recovered.source[0].last_error, null);
    assert.equal(recovered.source[0].last_link_count, 2);
    assert.ok(
      recovered.source[0].last_success >= before.source[0].last_success,
    );
    assert.equal(recovered.citations.length, 2);
    assert.deepEqual(
      recovered.citations[0].first_seen_at,
      before.citations[0].first_seen_at,
    );
    assert.equal(
      await repository.verificationUrl(added.externalId),
      added.verificationUrl,
    );
    await repository.discovered(source, [
      { externalId: original.externalId, url: original.url },
      added,
    ]);
    const repeated = await read();
    assert.equal(repeated.citations.length, 2);
    assert.deepEqual(
      repeated.citations.map((row) => row.first_seen_at),
      recovered.citations.map((row) => row.first_seen_at),
    );
    assert.equal(
      await repository.verificationUrl(original.externalId),
      original.verificationUrl,
    );
  } finally {
    await repository.db.query(
      'ALTER TABLE social_discovery_sources DROP CONSTRAINT IF EXISTS river_final_status_fixture',
    );
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    await repository.db.end();
  }
});

void test('topic post reads dedupe rivers, order ties and null times, and follow source reassignment', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const topics = [crypto.randomUUID(), crypto.randomUUID()];
  const sources = topics.map((topic) => `topic-read-${topic}`);
  const ids = Array.from({ length: 6 }, (_, i) => `211694853247746867${i}`);
  const expected = (indices: number[]) =>
    indices.map((i) => ({
      externalId: ids[i],
      publishedAt:
        i === 3
          ? null
          : new Date(i === 0 ? '2026-10-20T00:00:00Z' : '2026-10-21T00:00:00Z'),
      embedHtml: `<p>Fixture ${i}</p>`,
    }));
  try {
    for (const [i, topic] of topics.entries()) {
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
        VALUES($1,'00000000-0000-4000-8000-000000000001','Read fixture','Fixture','Fixture',$2)`,
        [topic, 950 + i],
      );
      await repository.db.query(
        `INSERT INTO social_discovery_sources(id,topic_id,name,url) VALUES($1,$2,'Fixture',$3)`,
        [sources[i], topic, `https://example.org/${topic}`],
      );
    }
    assert.deepEqual(await repository.topicPosts(topics[0]), []);
    for (let i = 0; i < 5; i++) {
      await repository.store({
        platform: 'x',
        externalId: ids[i],
        url: `https://x.com/fixture/status/${ids[i]}`,
        author: 'Fixture',
        authorUrl: 'https://x.com/fixture',
        publishedAt: expected([i])[0].publishedAt?.toISOString() ?? null,
        metrics: {},
        embedHtml: `<p>Fixture ${i}</p>`,
      });
    }
    const links = ids.map((externalId) => ({
      externalId,
      url: `https://x.com/fixture/status/${externalId}`,
    }));
    await repository.discovered(
      sources[0],
      links.filter((_, i) => i !== 4),
    );
    await repository.discovered(sources[1], [links[1], links[4]]);
    assert.deepEqual(
      await repository.topicPosts(topics[0]),
      expected([1, 2, 0, 3]),
    );
    assert.deepEqual(await repository.topicPosts(topics[1]), expected([1, 4]));
    // Reading scope follows connections even when a topic is disabled; eligibility is separate.
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topics[0],
    ]);
    await repository.db.query(
      'UPDATE social_discovery_sources SET topic_id=$1 WHERE id=$2',
      [topics[0], sources[1]],
    );
    assert.deepEqual(
      await repository.topicPosts(topics[0]),
      expected([1, 2, 4, 0, 3]),
    );
    assert.deepEqual(await repository.topicPosts(topics[1]), []);
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=$1',
      [sources[0]],
    );
    assert.deepEqual(await repository.topicPosts(topics[0]), expected([1, 4]));
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topics[0]]);
    assert.deepEqual(await repository.topicPosts(topics[0]), []);
  } finally {
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=ANY($1::text[])',
      [sources],
    );
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      topics,
    ]);
    await repository.db.query(
      "DELETE FROM social_posts WHERE platform='x' AND external_id=ANY($1::text[])",
      [ids],
    );
    await repository.db.end();
  }
});

void test('verification URLs select the newest non-null evidence across all discovery paths', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const id = '2116948532477468699';
  const item = crypto.randomUUID();
  const call = crypto.randomUUID();
  const river = `verification-${item}`;
  const reddit = 'verificationfixture';
  const url = `https://x.com/fixture/status/${id}`;
  const paths = [
    ['x_link_citations', 'last_seen_at', 'publisher'],
    ['social_discovery_citations', 'last_seen_at', 'river'],
    ['reddit_x_citations', 'last_seen_at', 'reddit'],
    ['x_search_citations', 'discovered_at', 'search'],
  ] as const;
  try {
    assert.equal(await repository.verificationUrl(id), undefined);
    await repository.db.query(
      "INSERT INTO content_items(id,canonical_url,title,excerpt,published_at) VALUES($1,$2,'Fixture','Fixture',now())",
      [item, `https://example.org/${item}`],
    );
    await repository.db.query(
      "INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url) VALUES($1,$2,'hn',$3)",
      [id, item, url],
    );
    await repository.db.query(
      "INSERT INTO social_discovery_sources(id,name,url) VALUES($1,'Fixture',$2)",
      [river, `https://example.org/${river}`],
    );
    await repository.discovered(river, [{ externalId: id, url }]);
    await repository.db.query(
      "INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,embed_html,reddit_metadata) VALUES('reddit',$1,$2,'Fixture','https://example.org','Fixture','{}')",
      [reddit, `https://example.org/${reddit}`],
    );
    await repository.db.query(
      'INSERT INTO reddit_x_citations(reddit_id,external_id,canonical_url) VALUES($1,$2,$3)',
      [reddit, id, url],
    );
    await repository.db.query(
      "INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros) VALUES($1,'fixture','verification-fixture','pending',1)",
      [call],
    );
    await repository.db.query(
      'INSERT INTO x_search_citations(call_id,external_id,canonical_url) VALUES($1,$2,$3)',
      [call, id, url],
    );
    assert.equal(await repository.verificationUrl(id), undefined);
    // Offset timestamps compare by instant, independent of the discovery path.
    for (const [index, [table, time, label]] of paths.entries()) {
      await repository.db.query(
        `UPDATE ${table} SET verification_url=$2,${time}=$3 WHERE external_id=$1`,
        [
          id,
          `https://example.org/${label}`,
          `2026-11-02T0${index + 1}:00:00-07:00`,
        ],
      );
      assert.equal(
        await repository.verificationUrl(id),
        `https://example.org/${label}`,
      );
    }
    // Newer evidence without a URL cannot hide an older usable URL.
    for (const [index, [table, time]] of [...paths].reverse().entries()) {
      await repository.db.query(
        `UPDATE ${table} SET verification_url=NULL,${time}='2026-11-03T00:00:00Z' WHERE external_id=$1`,
        [id],
      );
      const remaining = paths.length - index - 2;
      assert.equal(
        await repository.verificationUrl(id),
        remaining < 0
          ? undefined
          : `https://example.org/${paths[remaining][2]}`,
      );
    }
    assert.equal(
      await repository.verificationUrl('2116948532477468698'),
      undefined,
    );
  } finally {
    await repository.db.query(
      'DELETE FROM x_search_citations WHERE call_id=$1',
      [call],
    );
    await repository.db.query('DELETE FROM x_discovery_calls WHERE id=$1', [
      call,
    ]);
    await repository.db.query(
      "DELETE FROM social_posts WHERE platform='reddit' AND external_id=$1",
      [reddit],
    );
    await repository.db.query(
      'DELETE FROM social_discovery_sources WHERE id=$1',
      [river],
    );
    await repository.db.query('DELETE FROM content_items WHERE id=$1', [item]);
    await repository.db.end();
  }
});

void test('candidate ordering favors citation breadth then freshness and numeric IDs, with bounded limits', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const repository = new PostgresSocialRepository();
  const pool = repository.db;
  const client = await pool.connect();
  Object.defineProperty(repository, 'db', { value: client });
  const topic = crypto.randomUUID();
  const sources = ['candidate-order-a', 'candidate-order-b'];
  const ids = ['90', '800', '799', '999', '1000'];
  try {
    await client.query('BEGIN');
    await client.query('UPDATE topics SET enabled=false');
    await client.query(
      `INSERT INTO topics(id,profile_id,name,description,include_guidance,position)
       VALUES($1,'00000000-0000-4000-8000-000000000001','Fixture','Fixture','Fixture',100)`,
      [topic],
    );
    for (const source of sources) {
      await client.query(
        `INSERT INTO social_discovery_sources(id,topic_id,name,url)
         VALUES($1,$2,'Fixture',$3)`,
        [source, topic, `https://example.org/${source}`],
      );
    }
    const cite = async (id: string, source: string, time: string) => {
      await client.query(
        `INSERT INTO social_discovery_citations(source_id,external_id,canonical_url,last_seen_at)
         VALUES($1,$2,$3,$4)`,
        [source, id, `https://x.com/fixture/status/${id}`, time],
      );
    };
    // Two citations beat newer single-source evidence. Equal instants use
    // numeric-ID ordering (length before lexical order), independent of timezone.
    for (const id of ids) {
      await cite(id, sources[0], '2026-11-02T10:00:00Z');
    }
    await cite('90', sources[1], '2026-11-01T10:00:00Z');
    await client.query(
      `UPDATE social_discovery_citations SET last_seen_at='2026-11-02T04:00:00-07:00'
       WHERE external_id='799' AND source_id=$1`,
      [sources[0]],
    );
    const ordered = ['90', '799', '1000', '999', '800'];
    assert.deepEqual(await repository.candidates(50), ordered);
    assert.deepEqual(await repository.candidates(3), ordered.slice(0, 3));
    assert.deepEqual(await repository.candidates(0), ['90']);
    assert.deepEqual(await repository.candidates(-10), ['90']);
    // Enough additional discoveries to exercise the hard request cap.
    for (let i = 0; i < 50; i++) {
      await cite(String(10000 + i), sources[0], '2026-10-01T00:00:00Z');
    }
    const all = [
      ...ordered,
      ...Array.from({ length: 50 }, (_, i) => String(10049 - i)),
    ];
    assert.deepEqual(await repository.candidates(50), all.slice(0, 50));
    assert.deepEqual(await repository.candidates(500), all.slice(0, 50));
    assert.deepEqual(await repository.candidates(1), ['90']);
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await pool.end();
  }
});
