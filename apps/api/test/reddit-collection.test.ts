import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { RedditListing } from '../src/modules/social/adapters/reddit-listing';
import { collectReddit } from '../src/modules/social/application/collect-reddit';
import { PostgresRedditRepository } from '../src/modules/social/database/reddit.repository';
import { PostgresSocialRepository } from '../src/modules/social/database/social.repository';
import type { RedditPost } from '../src/modules/social/domain/reddit';
import { selectTopicPosts } from '../src/modules/social/public/selection';

async function fixture() {
  const body = await readFile(
    'apps/api/test/fixtures/reddit/top.synthetic.json',
    'utf8',
  );
  return new RedditListing({ get: async () => body }).collect('nba');
}

void test('Reddit collection stops after first denied community and propagates storage failures', async () => {
  const calls: string[] = [];
  const communities = async () =>
    ['nba', 'Games'].map((community) => ({ community, topicIds: ['topic'] }));
  const store = async () => {
    throw new Error('storage');
  };
  assert.deepEqual(
    await collectReddit(
      { communities, store },
      {
        collect: async (c) => {
          calls.push(c);
          throw new Error('403');
        },
      },
    ),
    { communities: 0, posts: 0, errors: 1 },
  );
  assert.deepEqual(calls, ['nba']);
  await assert.rejects(
    collectReddit({ communities, store }, { collect: async () => [] }),
    /storage/,
  );
  const stored: RedditPost[][] = [];
  const posts = await fixture();
  assert.ok(posts.length > 0);
  const result = await collectReddit(
    {
      communities,
      store: async (p) => {
        stored.push(p);
      },
    },
    { collect: async () => posts },
  );
  assert.equal(result.communities, 2);
  assert.equal(stored[0].length, posts.length);
  assert.deepEqual(stored[1], []);
});

void test('Reddit storage preserves metadata, updates metrics, links configured topics and rolls back atomically', async () => {
  const repository = new PostgresRedditRepository();
  const posts = await fixture();
  const post = posts[0];
  const nba = '00000000-0000-4000-8000-000000000012';
  const gaming = '00000000-0000-4000-8000-000000000013';
  try {
    assert.ok(
      (await repository.communities())
        .find((c) => c.community === 'nba')
        ?.topicIds.includes(nba),
    );
    await repository.store([post], [nba, gaming]);
    await repository.store(
      [{ ...post, metrics: { ...post.metrics, score: 12345 } }],
      [nba],
    );
    const stored = (
      await repository.db.query(
        `SELECT * FROM social_posts WHERE platform='reddit' AND external_id=$1`,
        [post.externalId],
      )
    ).rows;
    assert.equal(stored.length, 1);
    assert.equal(stored[0].metrics.score, 12345);
    assert.equal(stored[0].reddit_metadata.title, post.title);
    assert.equal(stored[0].reddit_metadata.externalUrl, post.externalUrl);
    assert.equal(stored[0].published_at.toISOString(), post.publishedAt);
    assert.equal(stored[0].embed_html, '');
    assert.deepEqual(
      (
        await repository.db.query(
          'SELECT topic_id FROM reddit_topic_posts WHERE external_id=$1',
          [post.externalId],
        )
      ).rows,
      [{ topic_id: nba }],
    );
    const observationStart = new Date(post.publishedAt);
    const observationEnd = new Date(observationStart.getTime() + 86400000);
    const observations = await repository.observations(
      nba,
      observationStart,
      observationEnd,
    );
    assert.equal(observations.length, 1);
    assert.equal(observations[0].post.title, post.title);
    assert.equal(observations[0].post.metrics.score, 12345);
    assert.ok(Number.isFinite(Date.parse(observations[0].observedAt)));
    assert.equal(observations[0].citesX, true);
    assert.deepEqual(
      await repository.observations(gaming, observationStart, observationEnd),
      [],
    );
    await repository.db.query(
      'UPDATE topics SET reddit_communities=$2 WHERE id=$1',
      [nba, '[]'],
    );
    assert.deepEqual(
      await repository.observations(nba, observationStart, observationEnd),
      [],
    );
    await repository.db.query(
      'UPDATE topics SET reddit_communities=$2 WHERE id=$1',
      [nba, '["nba"]'],
    );
    const social = new PostgresSocialRepository();
    const xId = '2116948532477468673';
    assert.ok((await social.candidates(50)).includes(xId));
    assert.equal(
      await social.verificationUrl(xId),
      `https://twitter.com/fixture/status/${xId}`,
    );
    assert.equal(
      (await social.topicPosts(nba)).some((p) => p.externalId === xId),
      false,
    );
    const citations = () =>
      repository.db.query(
        'SELECT * FROM reddit_x_citations WHERE reddit_id=$1',
        [post.externalId],
      );
    assert.equal((await citations()).rows.length, 1);
    assert.equal((await citations()).rows[0].citing_engagement, 12345);
    await social.store({
      platform: 'x',
      externalId: xId,
      url: `https://x.com/i/web/status/${xId}`,
      author: 'fixture',
      authorUrl: 'https://twitter.com/fixture',
      publishedAt: post.publishedAt,
      metrics: {},
      embedHtml:
        '<blockquote class="twitter-tweet"><p lang="en">NBA synthetic highlight</p></blockquote>',
    });
    assert.ok((await social.topicPosts(nba)).some((p) => p.externalId === xId));
    assert.equal(
      (await social.topicPosts(gaming)).some((p) => p.externalId === xId),
      false,
    );
    const picks = await selectTopicPosts(
      repository.db,
      nba,
      { includeAny: ['NBA'], excludeAny: [] },
      new Date(post.publishedAt),
      new Date(Date.parse(post.publishedAt) + 1000),
      5,
    );
    assert.equal(picks[0]?.platform, 'x');
    assert.equal(picks[0]?.externalId, xId);
    // Repeated links count once; edited-away citations are removed, not accumulated.
    await repository.store(
      [{ ...post, text: `${post.externalUrl} ${post.externalUrl}` }],
      [nba],
    );
    assert.equal((await citations()).rows.length, 1);
    await repository.store([{ ...post, externalUrl: null, text: '' }], [nba]);
    assert.equal((await citations()).rows.length, 0);
    assert.equal(
      (await social.topicPosts(nba)).some((p) => p.externalId === xId),
      false,
    );
    await repository.store(
      [{ ...post, metrics: { ...post.metrics, score: 12345 } }],
      [nba],
    );
    await assert.rejects(
      repository.store(
        [
          { ...post, metrics: { ...post.metrics, score: 999 } },
          { ...post, externalId: 'INVALID!' },
        ],
        [nba],
      ),
    );
    assert.equal((await citations()).rows[0].citing_engagement, 12345);
    assert.equal(
      (
        await repository.db.query(
          `SELECT metrics FROM social_posts WHERE platform='reddit' AND external_id=$1`,
          [post.externalId],
        )
      ).rows[0].metrics.score,
      12345,
    );
    assert.equal(
      (
        await repository.db.query(
          `SELECT count(*)::int AS n FROM social_posts WHERE platform='x' AND external_id=$1`,
          [post.externalId],
        )
      ).rows[0].n,
      0,
    );
  } finally {
    await repository.db.query(
      "DELETE FROM social_posts WHERE platform='x' AND external_id='2116948532477468673'",
    );
    await repository.db.query(
      `DELETE FROM social_posts WHERE platform='reddit' AND external_id=ANY($1::text[])`,
      [posts.map((p) => p.externalId)],
    );
    await repository.db.end();
  }
});

void test('Reddit observations pin lookback boundaries, stable ordering and current configuration', async () => {
  const repository = new PostgresRedditRepository();
  const topic = crypto.randomUUID();
  const second = crypto.randomUUID();
  const prefix = `b${topic.replaceAll('-', '').slice(0, 10)}`;
  const start = new Date('2035-02-08T00:00:00Z');
  const end = new Date('2035-02-09T00:00:00Z');
  const base = (await fixture())[0];
  const posts: RedditPost[] = [
    ['a', '2035-02-01T05:30:00+05:30'], // inclusive seven-day lookback
    ['b', '2035-02-01T00:00:00.001Z'],
    ['c', '2035-02-08T23:59:59.999Z'],
    ['d', '2035-02-08T23:59:59.999Z'],
    ['old', '2035-01-31T23:59:59.999Z'],
    ['end', '2035-02-09T00:00:00Z'], // exclusive end
  ].map(([suffix, publishedAt]) => ({
    ...base,
    externalId: `${prefix}${suffix}`,
    publishedAt,
    url: `https://www.reddit.com/r/nba/comments/${prefix}${suffix}/`,
    text: '',
    externalUrl: null,
    subreddit: 'NbA',
  }));
  const read = () => repository.observations(topic, start, end);
  try {
    for (const id of [topic, second]) {
      await repository.db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,position,reddit_communities)
         VALUES($1,'00000000-0000-4000-8000-000000000001','Boundary','','',100,'["NBA","nba"]')`,
        [id],
      );
    }
    const community = (await repository.communities()).find(
      (c) => c.community === 'nba',
    )!;
    assert.equal(community.topicIds.filter((id) => id === topic).length, 1);
    assert.ok(community.topicIds.includes(second));
    assert.deepEqual(community.topicIds, [...community.topicIds].sort());
    await repository.store(posts, [topic, second]);
    await repository.store(posts, [topic, second]);
    const observations = await read();
    assert.deepEqual(
      observations.map((o) => o.post.externalId),
      ['c', 'd', 'b', 'a'].map((s) => `${prefix}${s}`),
    );
    assert.equal(
      observations.at(-1)!.post.publishedAt,
      '2035-02-01T00:00:00.000Z',
    );
    assert.ok(
      observations.every(
        (o) => !o.citesX && Number.isFinite(Date.parse(o.observedAt)),
      ),
    );
    assert.deepEqual(
      (await repository.observations(second, start, end)).map((o) => o.post),
      observations.map((o) => o.post),
    );
    // A failing later insert rolls back both the preceding update and a new post.
    await assert.rejects(
      repository.store(
        [
          {
            ...posts[0],
            title: 'Must roll back',
            text: 'https://x.com/fixture/status/2116948532477468673',
          },
          { ...posts[0], externalId: `${prefix}new` },
          { ...posts[0], externalId: 'INVALID!' },
        ],
        [topic],
      ),
    );
    assert.deepEqual(await read(), observations);
    assert.equal(
      (
        await repository.db.query(
          'SELECT 1 FROM social_posts WHERE external_id=$1',
          [`${prefix}new`],
        )
      ).rowCount,
      0,
    );
    await repository.db.query('UPDATE topics SET enabled=false WHERE id=$1', [
      topic,
    ]);
    assert.deepEqual(await read(), []);
    assert.ok(
      !(await repository.communities())
        .find((c) => c.community === 'nba')!
        .topicIds.includes(topic),
    );
    await repository.store(
      [{ ...posts[0], externalId: `${prefix}disabled` }],
      [topic],
    );
    await repository.db.query(
      `UPDATE topics SET enabled=true,reddit_communities='[]' WHERE id=$1`,
      [topic],
    );
    assert.deepEqual(await read(), []);
    await repository.db.query(
      `UPDATE topics SET reddit_communities='["nba"]' WHERE id=$1`,
      [topic],
    );
    assert.deepEqual(await read(), observations);
    await repository.db.query('DELETE FROM topics WHERE id=$1', [topic]);
    assert.deepEqual(await read(), []);
    assert.equal((await repository.observations(second, start, end)).length, 4);
  } finally {
    await repository.db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      [topic, second],
    ]);
    await repository.db.query(
      "DELETE FROM social_posts WHERE platform='reddit' AND external_id LIKE $1",
      [`${prefix}%`],
    );
    await repository.db.end();
  }
});
