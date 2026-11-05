import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  profileSettingsSchema,
  topicSchema,
  topicUpdateSchema,
} from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import { PostgresContentRepository } from '../src/modules/ingestion/database/content.repository';
import { readSourceStatus } from '../src/modules/operations/database/source-status';
import { PostgresProfileRepository } from '../src/modules/profiles/database/profile.repository';
import { validateSchedule } from '../src/modules/profiles/domain/schedule';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
void test('persisted default profile, schedule and configured topics satisfy contracts', async () => {
  const profiles = new PostgresProfileRepository();
  const topics = new PostgresTopicRepository();
  try {
    const profile = profileSettingsSchema.parse(await profiles.getDefault());
    assert.equal(validateSchedule(profile.schedule).ok, true);
    const rows = topicSchema.array().parse(await topics.listDefault());
    assert.ok(rows.length > 0);
    assert.ok(rows.every((t) => t.profileId === profile.id));
    assert.deepEqual(
      rows.map((t) => t.position),
      rows.map((_, index) => index),
    );
  } finally {
    await profiles.onModuleDestroy();
    await topics.onModuleDestroy();
  }
});

void test('topic reorder persists zero-based positions and rejects incomplete lists atomically', async () => {
  const topics = new PostgresTopicRepository();
  const original = await topics.listDefault();
  const ids = original.map((topic) => topic.id);
  try {
    const reversed = [...ids].reverse();
    assert.equal(await topics.reorderDefault(reversed), true);
    const reordered = await topics.listDefault();
    assert.deepEqual(
      reordered.map((topic) => topic.id),
      reversed,
    );
    assert.deepEqual(
      reordered.map((topic) => topic.position),
      reversed.map((_, index) => index),
    );
    for (const invalid of [
      [],
      ids.slice(1),
      [...ids, ids[0]],
      ['00000000-0000-4000-8000-999999999999', ...ids.slice(1)],
    ]) {
      assert.equal(await topics.reorderDefault(invalid), false);
      assert.deepEqual(await topics.listDefault(), reordered);
    }
  } finally {
    await topics.reorderDefault(ids);
    await topics.onModuleDestroy();
  }
});

void test('concurrent topic creation appends unique ordered topics without changing existing settings', async () => {
  const topics = new PostgresTopicRepository();
  const db = (await import('../src/libs/db/connections')).database();
  const original = await topics.listDefault();
  const created: string[] = [];
  try {
    const input = {
      name: 'Creation integration check',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 2,
      postBudget: 0,
      relevancePolicy: { includeAny: ['science'], excludeAny: [] },
    };
    const results = await Promise.all([
      topics.createDefault(input),
      topics.createDefault(input),
    ]);
    created.push(...results.map((topic) => topic.id));
    assert.equal(new Set(created).size, 2);
    const rows = topicSchema.array().parse(await topics.listDefault());
    assert.deepEqual(rows.slice(0, original.length), original);
    assert.deepEqual(
      rows.map((topic) => topic.position),
      rows.map((_, index) => index),
    );
    for (const topic of results) {
      assert.equal(topic.profileId, original[0].profileId);
      assert.deepEqual(topic.relevancePolicy, input.relevancePolicy);
      assert.deepEqual(topic.sources, []);
      assert.deepEqual(topic.queries, []);
      assert.deepEqual(topic.accounts, []);
      assert.equal(topic.enabled, false);
    }
    assert.equal(
      await topics.reorderDefault(original.map((topic) => topic.id)),
      false,
      'A stale order must not overwrite newly created topics',
    );
  } finally {
    await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [created]);
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('topic source connections validate atomically and reuse the shared collection catalog', async () => {
  const topics = new PostgresTopicRepository();
  const db = (await import('../src/libs/db/connections')).database();
  let id: string | undefined;
  try {
    const catalog = await topics.catalog();
    assert.ok(catalog.length > 0);
    const topic = await topics.createDefault({
      name: 'Source integration check',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 1,
      postBudget: 0,
      relevancePolicy: { includeAny: [], excludeAny: [] },
    });
    id = topic.id;
    const connected = await topics.connectDefault(id, [catalog[0].id]);
    assert.ok(connected);
    assert.deepEqual(connected.sources, [catalog[0].id]);
    for (const invalid of [
      [catalog[0].id, 'missing-source'],
      [catalog[0].id, catalog[0].id],
    ]) {
      assert.equal(await topics.connectDefault(id, invalid), false);
      assert.deepEqual(
        (await topics.listDefault()).find((t) => t.id === id)?.sources,
        [catalog[0].id],
      );
    }
    assert.equal(
      (
        await db.query(
          'SELECT count(*)::int AS n FROM content_sources WHERE topic_id=$1',
          [id],
        )
      ).rows[0].n,
      0,
    );
    assert.equal(
      await topics.connectDefault('00000000-0000-4000-8000-999999999999', []),
      null,
    );
    const disconnected = await topics.connectDefault(id, []);
    assert.ok(disconnected);
    assert.deepEqual(disconnected.sources, []);
  } finally {
    if (id) await db.query('DELETE FROM topics WHERE id=$1', [id]);
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('source replacement rolls back a failed insert and releases its lock for concurrent saves', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const other = new PostgresTopicRepository();
  const db = database();
  const original = await topics.listDefault();
  const catalog = await topics.catalog();
  let id: string | undefined;
  try {
    assert.ok(catalog.length >= 4);
    const created = await topics.createDefault({
      name: 'Connection rollback fixture',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 1,
      postBudget: 0,
      relevancePolicy: { includeAny: [], excludeAny: [] },
    });
    id = created.id;
    const baseline = await topics.connectDefault(id, [catalog[0].id]);
    assert.ok(baseline);
    // Fail after the repository has deleted the old connections, not at validation.
    await db.query(`ALTER TABLE topic_source_connections ADD CONSTRAINT connection_failure_fixture
      CHECK (topic_id <> '${id}'::uuid OR source_id <> '${catalog[1].id.replaceAll("'", "''")}')`);
    const rejected = [catalog[1].id, catalog[2].id];
    await assert.rejects(
      topics.connectDefault(id, rejected),
      /connection_failure_fixture/,
    );
    assert.deepEqual(
      (await topics.listDefault()).find((t) => t.id === id),
      baseline,
    );

    const accepted = [catalog[2].id, catalog[3].id].sort();
    const results = await Promise.allSettled([
      topics.connectDefault(id, rejected),
      other.connectDefault(id, accepted),
    ]);
    assert.equal(results[0].status, 'rejected');
    if (results[0].status === 'rejected')
      assert.match(String(results[0].reason), /connection_failure_fixture/);
    assert.equal(results[1].status, 'fulfilled');
    if (results[1].status === 'fulfilled') {
      assert.ok(results[1].value);
      assert.deepEqual(results[1].value, { ...baseline, sources: accepted });
    }
    assert.deepEqual(
      (await topics.listDefault()).find((t) => t.id === id),
      {
        ...baseline,
        sources: accepted,
      },
    );
    assert.deepEqual(await other.connectDefault(id, []), {
      ...baseline,
      sources: [],
    });
    assert.deepEqual(await topics.catalog(), catalog);
    assert.deepEqual(
      (await topics.listDefault()).filter((t) => t.id !== id),
      original,
    );
  } finally {
    await db.query(
      'ALTER TABLE topic_source_connections DROP CONSTRAINT IF EXISTS connection_failure_fixture',
    );
    if (id) await topics.deleteDefault(id);
    await db.end();
    await topics.onModuleDestroy();
    await other.onModuleDestroy();
  }
});

void test('profile schedule persists independently of topics and restores all fields', async () => {
  const profiles = new PostgresProfileRepository();
  const topics = new PostgresTopicRepository();
  const original = await profiles.getDefault();
  const before = await topics.listDefault();
  try {
    const schedule = {
      cadence: '30 9 * * *',
      timezone: 'Asia/Tokyo',
      coverageWindow: 'PT6H',
      storyBudget: 3,
      postBudget: 0,
    };
    assert.deepEqual(await profiles.updateDefault(schedule), {
      ...original,
      schedule,
    });
    assert.deepEqual((await profiles.getDefault()).schedule, schedule);
    assert.deepEqual(await topics.listDefault(), before);
  } finally {
    await profiles.updateDefault(original.schedule);
    await profiles.onModuleDestroy();
    await topics.onModuleDestroy();
  }
});

void test('topic deletion closes reading order and preserves shared sources, observations and profile scope', async () => {
  const topics = new PostgresTopicRepository();
  const db = (await import('../src/libs/db/connections')).database();
  const original = await topics.listDefault();
  const created: string[] = [];
  const sourceId = 'deletion-integration-fixture';
  const otherProfile = '00000000-0000-4000-8000-999999999998';
  const otherTopic = '00000000-0000-4000-8000-999999999997';
  let itemId: string | undefined;
  try {
    const input = {
      name: 'Deletion integration fixture',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 1,
      postBudget: 0,
      relevancePolicy: { includeAny: [], excludeAny: [] },
    };
    const first = await topics.createDefault(input);
    created.push(first.id);
    const second = await topics.createDefault(input);
    created.push(second.id);
    await db.query(
      "INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES($1,$2,'Fixture','feed','https://example.org/deletion-fixture')",
      [sourceId, first.id],
    );
    itemId = (
      await db.query(
        "INSERT INTO content_items(canonical_url,title,excerpt,published_at) VALUES('https://example.org/deletion-fixture','Fixture','Fixture',now()) RETURNING id",
      )
    ).rows[0].id;
    await db.query(
      'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2)',
      [sourceId, itemId],
    );
    await topics.connectDefault(first.id, [sourceId]);
    await topics.connectDefault(second.id, [sourceId]);
    await topics.reorderDefault([
      first.id,
      ...original.map((t) => t.id),
      second.id,
    ]);
    await db.query(
      "INSERT INTO profiles(id,name) VALUES($1,'Other profile fixture')",
      [otherProfile],
    );
    await db.query(
      "INSERT INTO topics(id,profile_id,name,description,include_guidance,position) VALUES($1,$2,'Other topic','','',0)",
      [otherTopic, otherProfile],
    );
    const before = await topics.listDefault();
    assert.equal(await topics.deleteDefault(otherTopic), null);
    assert.equal(
      await topics.deleteDefault('00000000-0000-4000-8000-999999999999'),
      null,
    );
    assert.deepEqual(await topics.listDefault(), before);
    const remaining = await topics.deleteDefault(first.id);
    assert.ok(remaining);
    assert.deepEqual(
      remaining.map((t) => t.id),
      [...original.map((t) => t.id), second.id],
    );
    assert.deepEqual(
      remaining.map((t) => t.position),
      remaining.map((_, i) => i),
    );
    assert.deepEqual(remaining.find((t) => t.id === second.id)?.sources, [
      sourceId,
    ]);
    assert.equal(
      (
        await db.query('SELECT topic_id FROM content_sources WHERE id=$1', [
          sourceId,
        ])
      ).rows[0].topic_id,
      null,
    );
    assert.equal(
      (
        await db.query(
          'SELECT 1 FROM content_observations WHERE source_id=$1 AND item_id=$2',
          [sourceId, itemId],
        )
      ).rowCount,
      1,
    );
    assert.equal(
      (
        await db.query(
          'SELECT 1 FROM topic_source_connections WHERE topic_id=$1',
          [first.id],
        )
      ).rowCount,
      0,
    );
    assert.equal(await topics.deleteDefault(first.id), null);
    await topics.deleteDefault(second.id);
    assert.deepEqual(await topics.listDefault(), original);
  } finally {
    await db.query('DELETE FROM content_observations WHERE source_id=$1', [
      sourceId,
    ]);
    await db.query('DELETE FROM content_sources WHERE id=$1', [sourceId]);
    if (itemId)
      await db.query('DELETE FROM content_items WHERE id=$1', [itemId]);
    await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [
      [...created, otherTopic],
    ]);
    await db.query('DELETE FROM profiles WHERE id=$1', [otherProfile]);
    await topics.reorderDefault(original.map((t) => t.id));
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('custom feed registration atomically connects and shares existing URLs without renaming catalog entries', async () => {
  const topics = new PostgresTopicRepository();
  const db = database();
  const ids: string[] = [];
  const url = 'https://example.org/custom-feed-integration-fixture';
  try {
    const input = {
      name: 'Feed integration fixture',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 1,
      postBudget: 0,
      relevancePolicy: { includeAny: [], excludeAny: [] },
    };
    for (let n = 0; n < 2; n++)
      ids.push((await topics.createDefault(input)).id);
    const [first, second] = await Promise.all(
      ids.map((id) => topics.addFeedDefault(id, { name: 'Fixture feed', url })),
    );
    assert.ok(first && second);
    assert.deepEqual(first.sources, second.sources);
    assert.equal(first.sources.length, 1);
    const repeated = await topics.addFeedDefault(ids[0], {
      name: 'Changed name',
      url,
    });
    assert.ok(repeated);
    assert.deepEqual(repeated.sources, first.sources);
    const sources = await db.query(
      'SELECT name,kind,topic_id FROM content_sources WHERE url=$1',
      [url],
    );
    assert.equal(sources.rowCount, 1);
    assert.deepEqual(sources.rows[0], {
      name: 'Fixture feed',
      kind: 'feed',
      topic_id: null,
    });
    assert.equal(
      await topics.addFeedDefault('00000000-0000-4000-8000-999999999999', {
        name: 'Missing',
        url: url + '-missing',
      }),
      null,
    );
    assert.equal(
      (
        await db.query('SELECT 1 FROM content_sources WHERE url=$1', [
          url + '-missing',
        ])
      ).rowCount,
      0,
    );
    await topics.deleteDefault(ids[0]);
    assert.deepEqual(
      (await topics.listDefault()).find((t) => t.id === ids[1])?.sources,
      first.sources,
    );
  } finally {
    await db.query('DELETE FROM topics WHERE id=ANY($1::uuid[])', [ids]);
    await db.query('DELETE FROM content_sources WHERE url=$1', [url]);
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('X account settings validate bounds and preserve omitted lists across updates', async () => {
  const topics = new PostgresTopicRepository();
  const original = (await topics.listDefault())[0];
  const input = topicUpdateSchema.parse({
    name: original.name,
    description: original.description,
    includeGuidance: original.includeGuidance,
    excludeGuidance: original.excludeGuidance,
    enabled: original.enabled,
    storyBudget: original.storyBudget,
    postBudget: original.postBudget,
    relevancePolicy: original.relevancePolicy,
    accounts: original.accounts,
  });
  try {
    // Parse only writable fields because topicUpdateSchema is intentionally strict.
    const { accounts: _accounts, ...legacy } = input;
    for (const accounts of [
      ['NBA', 'nba'],
      ['@NBA'],
      ['https://x.com/NBA'],
      [''],
      ['a'.repeat(16)],
      Array.from({ length: 21 }, (_, i) => `handle${i}`),
    ])
      assert.equal(
        topicUpdateSchema.safeParse({ ...legacy, accounts }).success,
        false,
      );
    const updated = await topics.updateDefault(original.id, {
      ...legacy,
      accounts: ['NBA', 'NBAPR'],
    });
    assert.deepEqual(updated?.accounts, ['NBA', 'NBAPR']);
    const search = new (
      await import('../src/modules/social/database/x-search.repository')
    ).PostgresXSearchRepository(database());
    try {
      assert.deepEqual((await search.topic(original.id))?.handles, [
        'NBA',
        'NBAPR',
      ]);
    } finally {
      await search.db.end();
    }
    assert.deepEqual(
      (await topics.updateDefault(original.id, legacy))?.accounts,
      ['NBA', 'NBAPR'],
    );
    assert.deepEqual(
      (await topics.updateDefault(original.id, { ...legacy, accounts: [] }))
        ?.accounts,
      [],
    );
    const created = await topics.createDefault({
      ...legacy,
      enabled: false,
      accounts: ['TestAccount'],
    });
    try {
      assert.deepEqual(created.accounts, ['TestAccount']);
    } finally {
      await topics.deleteDefault(created.id);
    }
  } finally {
    await topics.updateDefault(original.id, input);
    await topics.onModuleDestroy();
  }
});

void test('custom feed limits reject atomically while allowing existing connections at capacity', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const db = database();
  const prefix = 'feed-capacity-fixture-';
  let id: string | undefined;
  try {
    id = (
      await topics.createDefault({
        name: 'Capacity fixture',
        description: '',
        includeGuidance: '',
        excludeGuidance: '',
        enabled: false,
        storyBudget: 1,
        postBudget: 0,
        relevancePolicy: { includeAny: [], excludeAny: [] },
      })
    ).id;
    await db.query(
      `INSERT INTO content_sources(id,name,kind,url)
       SELECT $1 || n,'Capacity fixture','feed','https://example.org/' || $1 || n
       FROM generate_series(1,500-(SELECT count(*)::int FROM content_sources)) n`,
      [prefix],
    );
    const catalog = await topics.catalog();
    assert.equal(catalog.length, 500);
    const fixtureSources = catalog.filter((source) =>
      source.id.startsWith(prefix),
    );
    assert.ok(fixtureSources.length > 101);
    const connected = await topics.connectDefault(
      id,
      fixtureSources.slice(0, 100).map((source) => source.id),
    );
    assert.ok(connected);
    const newFeed = {
      name: 'Rejected fixture',
      url: 'https://example.org/capacity-rejected',
    };
    assert.equal(await topics.addFeedDefault(id, newFeed), false);
    assert.equal(await topics.addFeedDefault(id, fixtureSources[100]), false);
    const repeated = await topics.addFeedDefault(id, fixtureSources[0]);
    assert.ok(repeated);
    assert.deepEqual(repeated.sources, connected.sources);
    assert.deepEqual(await topics.catalog(), catalog);

    // Leave room in the catalog: connection capacity alone must prevent insertion.
    await db.query('DELETE FROM content_sources WHERE id=$1', [
      fixtureSources[101].id,
    ]);
    const belowCapacity = await topics.catalog();
    assert.equal(belowCapacity.length, 499);
    assert.equal(await topics.addFeedDefault(id, newFeed), false);
    assert.deepEqual(await topics.catalog(), belowCapacity);
    assert.deepEqual(
      (await topics.listDefault()).find((topic) => topic.id === id)?.sources,
      connected.sources,
    );

    // Leave room in the topic, then fill the catalog: existing URLs remain reusable.
    const reduced = await topics.connectDefault(
      id,
      connected.sources.slice(0, 99),
    );
    assert.ok(reduced);
    await db.query(
      "INSERT INTO content_sources(id,name,kind,url) VALUES($1,'Capacity fixture','feed',$2)",
      [fixtureSources[101].id, fixtureSources[101].url],
    );
    assert.equal(await topics.addFeedDefault(id, newFeed), false);
    const reused = await topics.addFeedDefault(id, fixtureSources[100]);
    assert.ok(reused);
    assert.equal(reused.sources.length, 100);
    assert.ok(reused.sources.includes(fixtureSources[100].id));
    assert.deepEqual(await topics.catalog(), catalog);
  } finally {
    if (id) await topics.deleteDefault(id);
    await db.query('DELETE FROM content_sources WHERE starts_with(id,$1)', [
      prefix,
    ]);
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('default-topic writes reject foreign profiles without changing either profile or the catalog', async () => {
  const topics = new PostgresTopicRepository();
  const db = database();
  const profile = '00000000-0000-4000-8000-999999999991';
  const foreign = '00000000-0000-4000-8000-999999999992';
  const missing = '00000000-0000-4000-8000-999999999993';
  const input = {
    name: 'Profile boundary fixture',
    description: '',
    includeGuidance: '',
    excludeGuidance: '',
    enabled: false,
    storyBudget: 1,
    postBudget: 0,
    relevancePolicy: { includeAny: [], excludeAny: [] },
  };
  try {
    await db.query(
      "INSERT INTO profiles(id,name) VALUES($1,'Profile boundary fixture')",
      [profile],
    );
    await db.query(
      "INSERT INTO topics(id,profile_id,name,description,include_guidance,position) VALUES($1,$2,'Foreign fixture','','',7)",
      [foreign, profile],
    );
    const before = await topics.listDefault();
    const catalog = await topics.catalog();
    const foreignBefore = (
      await db.query('SELECT * FROM topics WHERE id=$1', [foreign])
    ).rows;
    for (const id of [foreign, missing]) {
      assert.equal(await topics.updateDefault(id, input), null);
      assert.equal(await topics.connectDefault(id, [catalog[0].id]), null);
      assert.equal(
        await topics.addFeedDefault(id, {
          name: 'Unregistered fixture',
          url: 'https://example.org/profile-boundary.xml',
        }),
        null,
      );
      assert.equal(await topics.deleteDefault(id), null);
      assert.equal(
        await topics.reorderDefault([id, ...before.slice(1).map((t) => t.id)]),
        false,
      );
      assert.deepEqual(await topics.listDefault(), before);
      assert.deepEqual(await topics.catalog(), catalog);
      assert.deepEqual(
        (await db.query('SELECT * FROM topics WHERE id=$1', [foreign])).rows,
        foreignBefore,
      );
    }
    assert.equal(
      (
        await db.query(
          'SELECT count(*)::int AS n FROM topic_source_connections WHERE topic_id=$1',
          [foreign],
        )
      ).rows[0].n,
      0,
    );
  } finally {
    await db.query('DELETE FROM topics WHERE id=$1', [foreign]);
    await db.query('DELETE FROM profiles WHERE id=$1', [profile]);
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('rejected topic JSON writes roll back settings and creation order, then allow recovery', async () => {
  const topics = new PostgresTopicRepository();
  const before = await topics.listDefault();
  const input = {
    name: 'JSON rollback fixture',
    description: 'Unicode: café 🏀',
    includeGuidance: 'First line\nSecond line',
    excludeGuidance: '',
    enabled: false,
    storyBudget: 2,
    postBudget: 1,
    relevancePolicy: { includeAny: ['café'], excludeAny: ['promotion'] },
    accounts: ['FixtureAccount'],
    redditCommunities: ['nba'],
  };
  let created: string | undefined;
  try {
    const invalid = {
      ...input,
      redditCommunities: Array.from({ length: 21 }, (_, i) => `fixture${i}`),
    };
    await assert.rejects(topics.createDefault(invalid), { code: '23514' });
    assert.deepEqual(await topics.listDefault(), before);
    await assert.rejects(topics.updateDefault(before[0].id, invalid), {
      code: '23514',
    });
    assert.deepEqual(await topics.listDefault(), before);
    const topic = await topics.createDefault(input);
    created = topic.id;
    assert.equal(topic.position, before.length);
    for (const [key, value] of Object.entries(input))
      assert.deepEqual(topic[key as keyof typeof topic], value);
    const {
      accounts: _accounts,
      redditCommunities: _communities,
      ...legacy
    } = input;
    const retained = await topics.updateDefault(topic.id, {
      ...legacy,
      name: 'Recovered fixture',
    });
    assert.deepEqual(retained?.accounts, input.accounts);
    assert.deepEqual(retained?.redditCommunities, input.redditCommunities);
    const cleared = await topics.updateDefault(topic.id, {
      ...input,
      accounts: [],
      redditCommunities: [],
    });
    assert.deepEqual(cleared?.accounts, []);
    assert.deepEqual(cleared?.redditCommunities, []);
    assert.deepEqual(
      (await topics.listDefault()).slice(0, before.length),
      before,
    );
  } finally {
    if (created) await topics.deleteDefault(created);
    await topics.onModuleDestroy();
  }
});

void test('concurrent custom feeds compete atomically for the final catalog slot', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const db = database();
  const prefix = 'feed-final-slot-fixture-';
  const ids: string[] = [];
  const feeds = [0, 1].map((n) => ({
    name: `Final slot ${n}`,
    url: `https://example.org/${prefix}${n}`,
  }));
  try {
    for (let n = 0; n < 2; n++)
      ids.push(
        (
          await topics.createDefault({
            name: `Final slot topic ${n}`,
            description: '',
            includeGuidance: '',
            excludeGuidance: '',
            enabled: false,
            storyBudget: 1,
            postBudget: 0,
            relevancePolicy: { includeAny: [], excludeAny: [] },
          })
        ).id,
      );
    await db.query(
      `INSERT INTO content_sources(id,name,kind,url)
       SELECT $1 || n,'Final slot fixture','feed','https://example.org/catalog-' || $1 || n
       FROM generate_series(1,499-(SELECT count(*)::int FROM content_sources)) n`,
      [prefix],
    );
    assert.equal((await topics.catalog()).length, 499);
    const results = await Promise.all(
      ids.map((id, n) => topics.addFeedDefault(id, feeds[n])),
    );
    assert.equal(results.filter((result) => result === false).length, 1);
    const winner = results.findIndex((result) => !!result);
    assert.ok(winner >= 0);
    const loser = 1 - winner;
    const catalog = await topics.catalog();
    assert.equal(catalog.length, 500);
    const saved = catalog.filter((source) =>
      feeds.some((feed) => feed.url === source.url),
    );
    assert.equal(saved.length, 1);
    assert.equal(saved[0].url, feeds[winner].url);
    const rows = await topics.listDefault();
    assert.deepEqual(rows.find((topic) => topic.id === ids[winner])?.sources, [
      saved[0].id,
    ]);
    assert.deepEqual(
      rows.find((topic) => topic.id === ids[loser])?.sources,
      [],
    );
    // A rejected transaction must release its lock and leave the connection reusable.
    const recovered = await topics.addFeedDefault(ids[loser], feeds[winner]);
    assert.ok(recovered);
    assert.deepEqual(recovered.sources, [saved[0].id]);
    assert.deepEqual(await topics.catalog(), catalog);
  } finally {
    for (const id of ids) await topics.deleteDefault(id);
    await db.query(
      'DELETE FROM content_sources WHERE starts_with(id,$1) OR url=ANY($2::text[])',
      [prefix, feeds.map((feed) => feed.url)],
    );
    await db.end();
    await topics.onModuleDestroy();
  }
});

void test('concurrent deletion and stale reorder serialize without losing remaining topic settings', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const original = await topics.listDefault();
  const ids = original.map((topic) => topic.id);
  const created: string[] = [];
  try {
    for (let index = 0; index < 3; index++) {
      const topic = await topics.createDefault({
        name: `Deletion race fixture ${index}`,
        description: 'Disposable topic',
        includeGuidance: 'Preserve this guidance',
        excludeGuidance: '',
        enabled: false,
        storyBudget: 2,
        postBudget: 0,
        relevancePolicy: { includeAny: ['science'], excludeAny: [] },
      });
      created.push(topic.id);
    }
    const before = await topics.listDefault();
    const reversed = before.map((topic) => topic.id).reverse();
    const [reordered, deleted] = await Promise.all([
      topics.reorderDefault(reversed),
      topics.deleteDefault(created[1]),
    ]);
    assert.ok(deleted);
    const remaining = await topics.listDefault();
    const expected = (reordered ? [...before].reverse() : before)
      .filter((topic) => topic.id !== created[1])
      .map((topic, position) => ({ ...topic, position }));
    assert.deepEqual(remaining, expected);
    // Two deletions must close both gaps even when they begin together.
    const results = await Promise.all([
      topics.deleteDefault(created[0]),
      topics.deleteDefault(created[2]),
    ]);
    assert.ok(results.every((result) => result !== null));
    const after = await topics.listDefault();
    assert.deepEqual(
      after,
      (reordered ? [...original].reverse() : original).map(
        (topic, position) => ({ ...topic, position }),
      ),
    );
    assert.equal(await topics.deleteDefault(created[1]), null);
    assert.equal(await topics.reorderDefault(reversed), false);
    assert.deepEqual(await topics.listDefault(), after);
    assert.equal(await topics.reorderDefault(ids), true);
    assert.deepEqual(await topics.listDefault(), original);
  } finally {
    for (const id of created) await topics.deleteDefault(id);
    await topics.reorderDefault(ids);
    await topics.onModuleDestroy();
  }
});

void test('rejected topic reorders preserve complete settings and release locks for competing saves', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const other = new PostgresTopicRepository();
  const db = database();
  const original = await topics.listDefault();
  const ids = original.map((topic) => topic.id);
  const catalog = await topics.catalog();
  const profiles = new PostgresProfileRepository();
  const profile = await profiles.getDefault();
  try {
    assert.ok(ids.length >= 3);
    // Reject a real position update after membership validation and row locking.
    await db.query(`ALTER TABLE topics ADD CONSTRAINT reorder_failure_fixture
      CHECK (id <> '${ids[0]}'::uuid OR position = 0)`);
    const rejected = [...ids].reverse();
    await assert.rejects(
      topics.reorderDefault(rejected),
      /reorder_failure_fixture/,
    );
    assert.deepEqual(await topics.listDefault(), original);

    const accepted = [ids[0], ...ids.slice(1).reverse()];
    const outcomes = await Promise.allSettled([
      topics.reorderDefault(rejected),
      other.reorderDefault(accepted),
    ]);
    assert.equal(outcomes[0].status, 'rejected');
    if (outcomes[0].status === 'rejected')
      assert.match(String(outcomes[0].reason), /reorder_failure_fixture/);
    assert.deepEqual(outcomes[1], { status: 'fulfilled', value: true });
    const expected = accepted.map((id, position) => ({
      ...original.find((topic) => topic.id === id)!,
      position,
    }));
    assert.deepEqual(await topics.listDefault(), expected);
    assert.deepEqual(await other.listDefault(), expected);
    assert.deepEqual(await topics.catalog(), catalog);
    assert.deepEqual(await profiles.getDefault(), profile);
    await db.query(
      'ALTER TABLE topics DROP CONSTRAINT reorder_failure_fixture',
    );
    assert.equal(await topics.reorderDefault(rejected), true);
    assert.deepEqual(
      await other.listDefault(),
      [...original]
        .reverse()
        .map((topic, position) => ({ ...topic, position })),
    );
    assert.equal(await other.reorderDefault(ids), true);
    assert.deepEqual(await topics.listDefault(), original);
  } finally {
    await db.query(
      'ALTER TABLE topics DROP CONSTRAINT IF EXISTS reorder_failure_fixture',
    );
    await topics.reorderDefault(ids);
    await Promise.all([
      db.end(),
      topics.onModuleDestroy(),
      other.onModuleDestroy(),
      profiles.onModuleDestroy(),
    ]);
  }
});

void test('failed custom-feed connection rolls back catalog registration and permits retry', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const db = database();
  const original = await topics.listDefault();
  const catalog = await topics.catalog();
  const target = original[0];
  const input = {
    name: 'Atomic feed registration fixture',
    url: 'https://atomic-registration.example.test/feed.xml',
  };
  let sourceId: string | undefined;
  try {
    assert.ok(!catalog.some((source) => source.url === input.url));
    // Reject the connection only after the new source has been inserted.
    await db.query(`ALTER TABLE topic_source_connections
      ADD CONSTRAINT feed_registration_failure_fixture
      CHECK (topic_id <> '${target.id}'::uuid) NOT VALID`);
    await assert.rejects(
      topics.addFeedDefault(target.id, input),
      /feed_registration_failure_fixture/,
    );
    assert.deepEqual(await topics.catalog(), catalog);
    assert.deepEqual(await topics.listDefault(), original);

    await db.query(
      'ALTER TABLE topic_source_connections DROP CONSTRAINT feed_registration_failure_fixture',
    );
    const recovered = await topics.addFeedDefault(target.id, input);
    assert.ok(recovered);
    const registered = (await topics.catalog()).filter(
      (source) => source.url === input.url,
    );
    assert.equal(registered.length, 1);
    sourceId = registered[0].id;
    assert.equal(registered[0].name, input.name);
    assert.deepEqual(recovered, {
      ...target,
      sources: [...target.sources, sourceId].sort(),
    });
    assert.deepEqual(await topics.addFeedDefault(target.id, input), recovered);
    assert.equal((await topics.catalog()).length, catalog.length + 1);
    assert.deepEqual((await topics.listDefault()).slice(1), original.slice(1));
  } finally {
    await db.query(
      'ALTER TABLE topic_source_connections DROP CONSTRAINT IF EXISTS feed_registration_failure_fixture',
    );
    if (sourceId) {
      await db.query(
        'DELETE FROM topic_source_connections WHERE source_id=$1',
        [sourceId],
      );
      await db.query('DELETE FROM content_sources WHERE id=$1', [sourceId]);
    }
    await Promise.all([db.end(), topics.onModuleDestroy()]);
  }
});

void test('failed deletion restores cascaded connections and positions before a successful retry', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const topics = new PostgresTopicRepository();
  const db = database();
  const original = await topics.listDefault();
  const catalog = await topics.catalog();
  const created: string[] = [];
  try {
    const {
      id: _id,
      profileId: _profileId,
      position: _position,
      sources: _sources,
      queries: _queries,
      ...input
    } = original[0];
    const first = await topics.createDefault({
      ...input,
      name: 'Deletion rollback target',
      enabled: false,
    });
    created.push(first.id);
    const second = await topics.createDefault({
      ...input,
      name: 'Deletion rollback successor',
      enabled: false,
    });
    created.push(second.id);
    assert.ok(catalog.length > 0);
    assert.ok(await topics.connectDefault(first.id, [catalog[0].id]));
    const before = await topics.listDefault();
    // Fail after DELETE has cascaded, when the successor's gap is closed.
    await db.query(`ALTER TABLE topics ADD CONSTRAINT deletion_failure_fixture
      CHECK (id <> '${second.id}'::uuid OR position = ${second.position})`);
    await assert.rejects(
      topics.deleteDefault(first.id),
      /deletion_failure_fixture/,
    );
    assert.deepEqual(await topics.listDefault(), before);
    assert.deepEqual(await topics.catalog(), catalog);
    await db.query(
      'ALTER TABLE topics DROP CONSTRAINT deletion_failure_fixture',
    );
    const remaining = await topics.deleteDefault(first.id);
    assert.deepEqual(
      remaining,
      before
        .filter((topic) => topic.id !== first.id)
        .map((topic, position) => ({ ...topic, position })),
    );
    assert.equal(await topics.deleteDefault(first.id), null);
    await topics.deleteDefault(second.id);
    assert.deepEqual(await topics.listDefault(), original);
    assert.deepEqual(await topics.catalog(), catalog);
  } finally {
    await db.query(
      'ALTER TABLE topics DROP CONSTRAINT IF EXISTS deletion_failure_fixture',
    );
    for (const id of created) await topics.deleteDefault(id);
    await topics.onModuleDestroy();
    await db.end();
  }
});

void test('source pause preserves connections and stored data while excluding collection across topics', async () => {
  const topics = new PostgresTopicRepository();
  const content = new PostgresContentRepository();
  const pool = database();
  const source = (await content.sources())[0];
  assert.ok(source);
  const before = await topics.listDefault();
  try {
    assert.equal(await topics.setSourceEnabled(source.id, false), true);
    assert.equal(
      (await content.sources()).some((item) => item.id === source.id),
      false,
    );
    const paused = (await readSourceStatus(pool)).find(
      (item) => item.id === source.id,
    )!;
    assert.equal(paused.enabled, false);
    assert.equal(paused.active, false);
    assert.deepEqual(await topics.listDefault(), before);
    assert.equal(await topics.setSourceEnabled('missing-source', false), false);
    assert.equal(await topics.setSourceEnabled(source.id, true), true);
    assert.ok((await content.sources()).some((item) => item.id === source.id));
    const resumed = (await readSourceStatus(pool)).find(
      (item) => item.id === source.id,
    )!;
    assert.equal(resumed.active, true);
    assert.equal(resumed.storedItems, paused.storedItems);
  } finally {
    await topics.setSourceEnabled(source.id, true);
    await topics.onModuleDestroy();
    await content.onModuleDestroy();
    await pool.end();
  }
});
