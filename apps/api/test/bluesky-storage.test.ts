import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PostgresBlueskyRepository } from '../src/modules/social/database/bluesky.repository';
import type { BlueskyPost } from '../src/modules/social/domain/bluesky';

const topic = '00000000-0000-4000-8000-000000000012';
const other = '00000000-0000-4000-8000-000000000013';
const start = new Date('2026-10-01T00:00:00Z');
const end = new Date('2026-10-02T00:00:00Z');
const post: BlueskyPost = {
  platform: 'bluesky',
  externalId: 'at://did:plc:synthetic/app.bsky.feed.post/abc123',
  url: 'https://bsky.app/profile/synthetic.test/post/abc123',
  author: 'synthetic.test',
  text: 'Synthetic NBA highlight',
  publishedAt: start.toISOString(),
  observedAt: '2026-10-01T12:00:00.000Z',
  metrics: { likes: 10, reposts: 2, replies: 1 },
  media: [
    {
      type: 'image',
      thumbnail: 'https://cdn.bsky.app/thumb.jpg',
      fullsize: 'https://cdn.bsky.app/full.jpg',
      alt: 'Synthetic image',
    },
  ],
};

void test('Bluesky storage keeps immutable topic snapshots, cutoff/window bounds and newest current metadata', async () => {
  const repo = new PostgresBlueskyRepository();
  const later = {
    ...post,
    observedAt: '2026-10-01T13:00:00.000Z',
    metrics: { ...post.metrics, likes: 20 },
  };
  try {
    await repo.store(topic, [later, post, post]);
    await repo.store(topic, [{ ...post, text: 'conflicting replay' }]);
    assert.deepEqual(
      await repo.observations(topic, start, end, new Date(post.observedAt)),
      [post],
    );
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      later,
      post,
    ]);
    assert.deepEqual(await repo.observations(other, start, end, end), []);
    assert.deepEqual(
      await repo.observations(topic, new Date('2026-09-30'), start, end),
      [],
    );
    assert.deepEqual(
      await repo.observations(
        topic,
        start,
        end,
        new Date('2026-10-01T11:59:59Z'),
      ),
      [],
    );
    await repo.store(other, [post]);
    assert.deepEqual(await repo.observations(other, start, end, end), [post]);
    const current = (
      await repo.db.query(
        "SELECT metrics,bluesky_metadata FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [post.externalId],
      )
    ).rows[0];
    assert.equal(current.metrics.likes, 20);
    assert.deepEqual(current.bluesky_metadata, {
      text: post.text,
      media: post.media,
    });
    await assert.rejects(repo.observations(topic, end, start, end), /Invalid/);
  } finally {
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [post.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky storage rolls back complete batches and respects topic disable/delete', async () => {
  const repo = new PostgresBlueskyRepository();
  const id = '11111111-1111-4111-8111-111111111319';
  try {
    await repo.db.query(
      "INSERT INTO topics(id,profile_id,name,description,include_guidance,exclude_guidance,position) VALUES($1,'00000000-0000-4000-8000-000000000001','Synthetic Bluesky','','','',999)",
      [id],
    );
    await assert.rejects(
      repo.store(id, [post, { ...post, externalId: 'bad-id' }]),
    );
    assert.deepEqual(await repo.observations(id, start, end, end), []);
    assert.equal(
      (
        await repo.db.query(
          "SELECT 1 FROM social_posts WHERE platform='bluesky' AND external_id=$1",
          [post.externalId],
        )
      ).rowCount,
      0,
    );
    await assert.rejects(
      repo.store(id, [
        post,
        { ...post, metrics: { likes: -1, reposts: 0, replies: 0 } },
      ]),
      /Invalid/,
    );
    await repo.store(id, [post]);
    await repo.db.query('UPDATE topics SET enabled=false WHERE id=$1', [id]);
    await repo.store(id, [{ ...post, observedAt: '2026-10-01T14:00:00Z' }]);
    assert.deepEqual(await repo.observations(id, start, end, end), []);
    assert.equal(
      (
        await repo.db.query(
          'SELECT 1 FROM bluesky_observations WHERE topic_id=$1',
          [id],
        )
      ).rowCount,
      1,
    );
    await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    assert.equal(
      (
        await repo.db.query(
          'SELECT 1 FROM bluesky_observations WHERE topic_id=$1',
          [id],
        )
      ).rowCount,
      0,
    );
  } finally {
    await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [post.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky failed refresh restores existing metadata and observations before an idempotent retry', async () => {
  const repo = new PostgresBlueskyRepository();
  const original = { ...post, externalId: post.externalId + 'rollback' };
  const inserted = { ...post, externalId: post.externalId + 'insert' };
  const refreshed: BlueskyPost = {
    ...original,
    author: 'updated.test',
    text: 'Updated synthetic observation',
    observedAt: '2026-10-01T14:00:00.000Z',
    metrics: { likes: 25, reposts: 4, replies: 3 },
    media: [],
  };
  const current = async () =>
    (
      await repo.db.query(
        "SELECT canonical_url,author,author_url,published_at,metrics,embed_html,verified_at,bluesky_metadata FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [original.externalId],
      )
    ).rows[0];
  try {
    await repo.store(topic, [original]);
    await repo.store(other, [original]);
    const before = await current();
    await assert.rejects(
      repo.store(topic, [
        refreshed,
        inserted,
        {
          ...post,
          externalId: post.externalId + 'invalid',
          metrics: { likes: 0.5, reposts: 0, replies: 0 },
        },
      ]),
      /Invalid Bluesky observation/,
    );
    assert.deepEqual(await current(), before);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      original,
    ]);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
    assert.equal(
      (
        await repo.db.query(
          "SELECT 1 FROM social_posts WHERE platform='bluesky' AND external_id=$1",
          [inserted.externalId],
        )
      ).rowCount,
      0,
    );

    await repo.store(topic, [refreshed, inserted]);
    const after = await current();
    assert.equal(after.author, refreshed.author);
    assert.deepEqual(after.metrics, refreshed.metrics);
    assert.deepEqual(after.bluesky_metadata, {
      text: refreshed.text,
      media: [],
    });
    const observations = await repo.observations(topic, start, end, end);
    assert.equal(observations.length, 3);
    assert.deepEqual(
      observations.filter((p) => p.externalId === original.externalId),
      [refreshed, original],
    );
    assert.deepEqual(
      observations.filter((p) => p.externalId === inserted.externalId),
      [inserted],
    );
    await repo.store(topic, [refreshed, inserted]);
    assert.deepEqual(await current(), after);
    assert.deepEqual(
      await repo.observations(topic, start, end, end),
      observations,
    );
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
  } finally {
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=ANY($1::text[])",
      [[original.externalId, inserted.externalId, post.externalId + 'invalid']],
    );
    await repo.db.end();
  }
});

void test('Bluesky observation windows preserve millisecond bounds and stable snapshot ordering', async () => {
  const repo = new PostgresBlueskyRepository();
  const make = (
    suffix: string,
    publishedAt: string,
    observedAt = '2026-10-02T12:00:00.000Z',
  ): BlueskyPost => ({
    ...post,
    externalId: post.externalId + suffix,
    publishedAt,
    observedAt,
  });
  const lower = make('bounda', '2026-09-30T17:00:00-07:00');
  const tied = make('boundb', start.toISOString());
  const latest = make('boundc', '2026-10-01T23:59:59.999Z');
  const before = make('boundd', '2026-09-30T23:59:59.999Z');
  const upper = make('bounde', end.toISOString());
  const refresh = {
    ...lower,
    text: 'Later immutable snapshot',
    observedAt: '2026-10-02T12:00:00.001Z',
  };
  const rows = [upper, tied, before, refresh, latest, lower];
  try {
    await repo.store(topic, rows);
    const cutoff = new Date(lower.observedAt);
    assert.deepEqual(await repo.observations(topic, start, end, cutoff), [
      latest,
      lower,
      tied,
    ]);
    assert.deepEqual(
      await repo.observations(
        topic,
        start,
        end,
        new Date(cutoff.getTime() - 1),
      ),
      [],
    );
    assert.deepEqual(
      await repo.observations(topic, start, end, new Date(refresh.observedAt)),
      [latest, refresh, lower, tied],
    );
    assert.deepEqual(
      await repo.observations(topic, end, new Date(end.getTime() + 1), cutoff),
      [upper],
    );
    for (const args of [
      [new Date(NaN), end, end],
      [start, new Date(NaN), end],
      [start, end, new Date(NaN)],
      [start, start, end],
    ])
      await assert.rejects(
        repo.observations(topic, args[0], args[1], args[2]),
        /Invalid Bluesky observation window/,
      );
  } finally {
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=ANY($1::text[])",
      [rows.map((row) => row.externalId)],
    );
    await repo.db.end();
  }
});
