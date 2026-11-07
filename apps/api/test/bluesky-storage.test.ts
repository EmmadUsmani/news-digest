import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  PostgresBlueskyRepository,
  readBlueskyObservations,
} from '../src/modules/social/database/bluesky.repository';
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
  displayText: 'Synthetic NBA highlight https://example.com/highlight',
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

void test('Bluesky observation limit retains the newest 5000 snapshots before applying an earlier cutoff', async () => {
  const repo = new PostgresBlueskyRepository();
  const base = {
    ...post,
    externalId: 'at://did:plc:synthetic/app.bsky.feed.post/limit123',
  };
  const rows = Array.from({ length: 5001 }, (_, index) => ({
    ...base,
    observedAt: new Date(Date.parse(post.observedAt) + index).toISOString(),
    metrics: { ...post.metrics, likes: index },
  }));
  try {
    // Ascending insertion ensures the read must order before limiting.
    await repo.store(topic, rows);
    const retained = await repo.observations(topic, start, end, end);
    assert.equal(retained.length, 5000);
    assert.deepEqual(retained, rows.slice(1).reverse());
    // The cap applies to snapshots, not distinct posts. Filtering occurs first.
    assert.deepEqual(
      await repo.observations(topic, start, end, new Date(rows[1].observedAt)),
      [rows[1], rows[0]],
    );
    assert.deepEqual(await repo.observations(other, start, end, end), []);
  } finally {
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [base.externalId],
    );
    await repo.db.end();
  }
});

void test('concurrent Bluesky collections retain both topic histories and newest complete metadata', async () => {
  const first = new PostgresBlueskyRepository();
  const second = new PostgresBlueskyRepository();
  const original: BlueskyPost = {
    ...post,
    externalId: post.externalId + 'concurrent',
  };
  const newer: BlueskyPost = {
    ...original,
    author: 'newer.test',
    url: 'https://bsky.app/profile/newer.test/post/abc123concurrent',
    text: 'Newer synthetic collection',
    observedAt: '2026-10-01T14:00:00.000Z',
    metrics: { likes: 99, reposts: 12, replies: 7 },
    media: [],
  };
  const older: BlueskyPost = {
    ...original,
    author: 'older.test',
    text: 'Older synthetic collection',
    observedAt: '2026-10-01T13:00:00.000Z',
    metrics: { likes: 20, reposts: 3, replies: 2 },
  };
  const current = async () =>
    (
      await first.db.query(
        "SELECT canonical_url,author,author_url,published_at,metrics,verified_at,bluesky_metadata FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [original.externalId],
      )
    ).rows;
  try {
    // Exercise both invocation orders; each pair uses separate connections.
    for (const reverse of [false, true]) {
      await first.store(topic, [original]);
      await Promise.all(
        reverse
          ? [second.store(other, [older]), first.store(topic, [newer])]
          : [first.store(topic, [newer]), second.store(other, [older])],
      );
      assert.deepEqual(await current(), [
        {
          canonical_url: newer.url,
          author: newer.author,
          author_url: 'https://bsky.app/profile/newer.test',
          published_at: new Date(newer.publishedAt),
          metrics: newer.metrics,
          verified_at: new Date(newer.observedAt),
          bluesky_metadata: { text: newer.text, media: [] },
        },
      ]);
      assert.deepEqual(await first.observations(topic, start, end, end), [
        newer,
        original,
      ]);
      assert.deepEqual(await second.observations(other, start, end, end), [
        older,
      ]);
      await Promise.all([
        first.store(topic, [newer, original]),
        second.store(other, [older]),
      ]);
      assert.equal((await current()).length, 1);
      assert.deepEqual(await first.observations(topic, start, end, end), [
        newer,
        original,
      ]);
      assert.deepEqual(await second.observations(other, start, end, end), [
        older,
      ]);
      await first.db.query(
        "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [original.externalId],
      );
    }
  } finally {
    await first.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [original.externalId],
    );
    await Promise.all([first.db.end(), second.db.end()]);
  }
});

void test('Bluesky collection rechecks topic eligibility after a concurrent disable or deletion', async () => {
  const repo = new PostgresBlueskyRepository();
  const id = '11111111-1111-4111-8111-111111111558';
  const editor = await repo.db.connect();
  let collecting: Promise<void> | undefined;
  try {
    const {
      rows: [{ pid }],
    } = await editor.query<{ pid: number }>('SELECT pg_backend_pid() AS pid');
    for (const action of ['disable', 'delete'] as const) {
      await repo.db.query(
        "INSERT INTO topics(id,profile_id,name,description,include_guidance,exclude_guidance,position) VALUES($1,'00000000-0000-4000-8000-000000000001','Synthetic concurrent configuration','','','',999)",
        [id],
      );
      await editor.query('BEGIN');
      await editor.query('SELECT id FROM topics WHERE id=$1 FOR UPDATE', [id]);
      collecting = repo.store(id, [post]);
      // Observe an actual database lock wait rather than relying on a fixed delay.
      let blocked = false;
      for (let attempt = 0; attempt < 200; attempt++) {
        const result = await repo.db.query(
          'SELECT 1 FROM pg_stat_activity WHERE $1::int = ANY(pg_blocking_pids(pid))',
          [pid],
        );
        if (result.rowCount) {
          blocked = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.equal(
        blocked,
        true,
        'collector must wait for the configuration transaction',
      );
      await editor.query(
        action === 'disable'
          ? 'UPDATE topics SET enabled=false WHERE id=$1'
          : 'DELETE FROM topics WHERE id=$1',
        [id],
      );
      await editor.query('COMMIT');
      await collecting;
      collecting = undefined;
      assert.deepEqual(await repo.observations(id, start, end, end), []);
      assert.equal(
        (
          await repo.db.query(
            'SELECT 1 FROM bluesky_observations WHERE topic_id=$1',
            [id],
          )
        ).rowCount,
        0,
      );
      assert.equal(
        (
          await repo.db.query(
            "SELECT 1 FROM social_posts WHERE platform='bluesky' AND external_id=$1",
            [post.externalId],
          )
        ).rowCount,
        0,
      );
      await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    }
  } finally {
    await editor.query('ROLLBACK');
    await collecting;
    editor.release();
    await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [post.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky equal-time conflicts preserve first current metadata and independent topic snapshots', async () => {
  const repo = new PostgresBlueskyRepository();
  const first: BlueskyPost = {
    ...post,
    externalId: 'at://did:plc:synthetic/app.bsky.feed.post/equaltime',
    media: undefined,
  };
  const conflicting: BlueskyPost = {
    ...first,
    author: 'other.test',
    url: 'https://bsky.app/profile/other.test/post/equaltime',
    text: 'Conflicting synthetic observation',
    metrics: { likes: 99, reposts: 8, replies: 4 },
    media: post.media,
  };
  // JSON storage omits optional undefined fields.
  const storedFirst = JSON.parse(JSON.stringify(first)) as BlueskyPost;
  try {
    await repo.store(topic, [first]);
    await repo.store(topic, [conflicting]);
    await repo.store(other, [conflicting]);
    await repo.store(other, [first]);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      storedFirst,
    ]);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      conflicting,
    ]);
    const current = (
      await repo.db.query(
        "SELECT canonical_url,author,author_url,metrics,bluesky_metadata FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [first.externalId],
      )
    ).rows;
    assert.deepEqual(current, [
      {
        canonical_url: first.url,
        author: first.author,
        author_url: 'https://bsky.app/profile/synthetic.test',
        metrics: first.metrics,
        bluesky_metadata: { text: first.text, media: [] },
      },
    ]);
    const newer = { ...conflicting, observedAt: '2026-10-01T12:00:00.001Z' };
    await repo.store(other, [newer]);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      newer,
      conflicting,
    ]);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      storedFirst,
    ]);
  } finally {
    await repo.db.query(
      'DELETE FROM bluesky_observations WHERE external_id=$1',
      [first.externalId],
    );
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [first.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky topic lifecycle restores retained history and isolates deletion from shared posts', async () => {
  const repo = new PostgresBlueskyRepository();
  const id = '11111111-1111-4111-8111-111111111563';
  const original = { ...post, externalId: post.externalId + 'lifecycle' };
  const skipped = {
    ...original,
    observedAt: '2026-10-01T13:00:00.000Z',
    text: 'Disabled write',
  };
  const resumed = {
    ...original,
    observedAt: '2026-10-01T14:00:00.000Z',
    text: 'Resumed write',
  };
  const insertTopic = () =>
    repo.db.query(
      "INSERT INTO topics(id,profile_id,name,description,include_guidance,exclude_guidance,position) VALUES($1,'00000000-0000-4000-8000-000000000001','Synthetic lifecycle','','','',999)",
      [id],
    );
  try {
    await insertTopic();
    await repo.store(id, [original]);
    await repo.store(other, [original]);
    await repo.db.query('UPDATE topics SET enabled=false WHERE id=$1', [id]);
    await repo.store(id, [skipped]);
    assert.deepEqual(await repo.observations(id, start, end, end), []);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
    await repo.db.query('UPDATE topics SET enabled=true WHERE id=$1', [id]);
    assert.deepEqual(await repo.observations(id, start, end, end), [original]);
    await repo.store(id, [resumed]);
    assert.deepEqual(await repo.observations(id, start, end, end), [
      resumed,
      original,
    ]);
    await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    await repo.store(id, [skipped]);
    assert.deepEqual(await repo.observations(id, start, end, end), []);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
    // Reusing the identifier cannot resurrect the deleted topic's snapshots.
    await insertTopic();
    assert.deepEqual(await repo.observations(id, start, end, end), []);
    await repo.store(id, [original]);
    assert.deepEqual(await repo.observations(id, start, end, end), [original]);
    const current = (
      await repo.db.query(
        "SELECT verified_at,bluesky_metadata FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [original.externalId],
      )
    ).rows[0];
    assert.equal(current.verified_at.toISOString(), resumed.observedAt);
    assert.deepEqual(current.bluesky_metadata, {
      text: resumed.text,
      media: resumed.media,
    });
  } finally {
    await repo.db.query('DELETE FROM topics WHERE id=$1', [id]);
    await repo.db.query(
      'DELETE FROM bluesky_observations WHERE external_id=$1',
      [original.externalId],
    );
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [original.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky snapshot insert failure rolls back current metadata and permits retry', async () => {
  const repo = new PostgresBlueskyRepository();
  const original = { ...post, externalId: post.externalId + 'snapshotfailure' };
  const refreshed = {
    ...original,
    observedAt: '2026-10-01T14:00:00.000Z',
    author: 'updated.test',
    text: 'Updated synthetic snapshot',
    metrics: { likes: 90, reposts: 8, replies: 4 },
  };
  const current = async () =>
    (
      await repo.db.query(
        "SELECT * FROM social_posts WHERE platform='bluesky' AND external_id=$1",
        [original.externalId],
      )
    ).rows;
  try {
    await repo.store(topic, [original]);
    await repo.store(other, [original]);
    const before = await current();
    // Fail after the current-post upsert, at the final immutable snapshot write.
    await repo.db
      .query(`ALTER TABLE bluesky_observations ADD CONSTRAINT test_snapshot_failure
      CHECK (external_id <> '${original.externalId}' OR observed_at <> '2026-10-01T14:00:00Z'::timestamptz)`);
    await assert.rejects(
      repo.store(topic, [refreshed]),
      /test_snapshot_failure/,
    );
    assert.deepEqual(await current(), before);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      original,
    ]);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
    await repo.db.query(
      'ALTER TABLE bluesky_observations DROP CONSTRAINT test_snapshot_failure',
    );
    await repo.store(topic, [refreshed]);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      refreshed,
      original,
    ]);
    const after = await current();
    assert.equal(after[0].author, refreshed.author);
    assert.deepEqual(after[0].metrics, refreshed.metrics);
    assert.deepEqual(after[0].bluesky_metadata, {
      text: refreshed.text,
      media: refreshed.media,
    });
    await repo.store(topic, [refreshed]);
    assert.deepEqual(await current(), after);
    assert.deepEqual(await repo.observations(topic, start, end, end), [
      refreshed,
      original,
    ]);
    assert.deepEqual(await repo.observations(other, start, end, end), [
      original,
    ]);
  } finally {
    await repo.db.query(
      'ALTER TABLE bluesky_observations DROP CONSTRAINT IF EXISTS test_snapshot_failure',
    );
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [original.externalId],
    );
    await repo.db.end();
  }
});

void test('Bluesky publisher reads honor transaction-local visibility and rollback', async () => {
  const repo = new PostgresBlueskyRepository();
  const client = await repo.db.connect();
  try {
    await repo.store(topic, [post]);
    await client.query('BEGIN');
    await client.query('UPDATE topics SET enabled=false WHERE id=$1', [topic]);
    assert.deepEqual(
      await readBlueskyObservations(client, topic, start, end, end),
      [],
    );
    // A separate connection still sees committed configuration and snapshots.
    assert.deepEqual(await repo.observations(topic, start, end, end), [post]);
    await client.query('ROLLBACK');
    assert.deepEqual(
      await readBlueskyObservations(client, topic, start, end, end),
      [post],
    );

    await client.query('BEGIN');
    await client.query(
      'DELETE FROM bluesky_observations WHERE topic_id=$1 AND external_id=$2',
      [topic, post.externalId],
    );
    assert.deepEqual(
      await readBlueskyObservations(client, topic, start, end, end),
      [],
    );
    assert.deepEqual(await repo.observations(topic, start, end, end), [post]);
    await client.query('ROLLBACK');
    assert.deepEqual(
      await readBlueskyObservations(client, topic, start, end, end),
      [post],
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await repo.db.query(
      "DELETE FROM social_posts WHERE platform='bluesky' AND external_id=$1",
      [post.externalId],
    );
    await repo.db.end();
  }
});
