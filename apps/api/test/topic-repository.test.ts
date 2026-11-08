import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';
import type { TopicRepository } from '../src/modules/topics/domain/topic.repository';

void test('topic connections replace atomically and custom feeds deduplicate across topics', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const adapter = new PostgresTopicRepository();
  const repository: TopicRepository = adapter;
  const original = await repository.listDefault();
  const catalog = await repository.catalog();
  const created: string[] = [];
  const input = {
    name: 'Repository fixture',
    description: 'Offline topic connections',
    includeGuidance: 'Science',
    excludeGuidance: 'Spam',
    enabled: false,
    storyBudget: 3,
    postBudget: 2,
    relevancePolicy: { includeAny: ['science'], excludeAny: ['spam'] },
    accounts: ['NASA'],
    redditCommunities: ['science'],
  };
  try {
    const first = await repository.createDefault(input);
    created.push(first.id);
    const second = await repository.createDefault({
      ...input,
      name: 'Second fixture',
    });
    created.push(second.id);
    const getFirst = async () =>
      (await repository.listDefault()).find((t) => t.id === first.id)!;
    assert.deepEqual(first.sources, []);
    const ids = catalog
      .slice(0, 2)
      .map((source) => source.id)
      .reverse();
    assert.equal(ids.length, 2);
    const connected = await repository.connectDefault(first.id, ids);
    assert.ok(connected);
    assert.deepEqual(connected.sources, [...ids].sort());
    const snapshot = await getFirst();
    assert.equal(
      await repository.connectDefault(first.id, [ids[0], 'unknown-source']),
      false,
    );
    assert.equal(
      await repository.connectDefault(first.id, [ids[0], ids[0]]),
      false,
    );
    assert.deepEqual(await getFirst(), snapshot);
    assert.equal(await repository.connectDefault(randomUUID(), ids), null);
    assert.deepEqual(await getFirst(), snapshot);

    const feed = {
      name: 'Shared offline feed',
      url: `https://example.com/${randomUUID()}.xml`,
    };
    const added = await repository.addFeedDefault(first.id, feed);
    assert.ok(added);
    const entry = (await repository.catalog()).filter(
      (source) => source.url === feed.url,
    );
    assert.equal(entry.length, 1);
    assert.deepEqual(added.sources, [...ids, entry[0].id].sort());
    assert.ok(
      await repository.addFeedDefault(first.id, {
        ...feed,
        name: 'Ignored rename',
      }),
    );
    const shared = await repository.addFeedDefault(second.id, feed);
    assert.ok(shared);
    assert.deepEqual(shared.sources, [entry[0].id]);
    assert.deepEqual(
      (await repository.catalog()).filter((source) => source.url === feed.url),
      entry,
    );
    assert.equal(
      await repository.addFeedDefault(randomUUID(), {
        ...feed,
        url: `${feed.url}?missing`,
      }),
      null,
    );
    assert.equal(
      (await repository.catalog()).some(
        (source) => source.url === `${feed.url}?missing`,
      ),
      false,
    );

    const cleared = await repository.connectDefault(first.id, []);
    assert.ok(cleared);
    assert.deepEqual(cleared.sources, []);
    await repository.deleteDefault(second.id);
    assert.ok(
      (await repository.catalog()).some((source) => source.id === entry[0].id),
    );
    // Registration is catalog data; deleting a topic must not delete a shared feed.
    const reconnected = await repository.connectDefault(first.id, [
      entry[0].id,
    ]);
    assert.ok(reconnected);
    assert.deepEqual(reconnected.sources, [entry[0].id]);
  } finally {
    for (const id of created) await repository.deleteDefault(id);
    assert.deepEqual(await repository.listDefault(), original);
    await adapter.onModuleDestroy();
  }
});

void test('system topic scope includes all ownerships and keeps new topics rollback-compatible', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const previous = process.env.SYSTEM_OWNERSHIP;
  delete process.env.SYSTEM_OWNERSHIP;
  const db = database();
  const adapter = new PostgresTopicRepository();
  const original = await adapter.listDefault();
  const foreignProfile = randomUUID();
  const nullTopic = randomUUID();
  const foreignTopic = randomUUID();
  const created: string[] = [];
  const input = {
    name: 'System topic fixture',
    description: 'Offline system ownership',
    includeGuidance: 'Science',
    excludeGuidance: 'Spam',
    enabled: false,
    storyBudget: 3,
    postBudget: 2,
    relevancePolicy: { includeAny: ['science'], excludeAny: ['spam'] },
    accounts: ['NASA'],
    redditCommunities: ['science'],
  };
  try {
    await db.query('INSERT INTO profiles(id,name) VALUES($1,$2)', [
      foreignProfile,
      'System scope fixture',
    ]);
    for (const [id, owner, position] of [
      [nullTopic, null, original.length],
      [foreignTopic, foreignProfile, original.length + 1],
    ]) {
      await db.query(
        `INSERT INTO topics(id,profile_id,name,description,include_guidance,exclude_guidance,position)
        VALUES($1,$2,$3,'','','',$4)`,
        [id, owner, 'System scope fixture', position],
      );
    }
    assert.deepEqual(await adapter.listDefault(), original);
    for (const id of [nullTopic, foreignTopic]) {
      assert.equal(await adapter.updateDefault(id, input), null);
      assert.equal(await adapter.connectDefault(id, []), null);
      assert.equal(await adapter.deleteDefault(id), null);
    }
    process.env.SYSTEM_OWNERSHIP = '1';
    const all = await adapter.listDefault();
    assert.equal(all.length, original.length + 2);
    assert.deepEqual(
      all.filter((t) => t.id !== nullTopic && t.id !== foreignTopic),
      original,
    );
    for (const id of [nullTopic, foreignTopic]) {
      assert.ok(
        await adapter.updateDefault(id, {
          ...input,
          name: 'Updated system topic',
        }),
      );
      const connected = await adapter.connectDefault(
        id,
        original[0].sources.slice(0, 1),
      );
      assert.ok(connected);
      assert.deepEqual(connected.sources, original[0].sources.slice(0, 1));
      assert.ok(
        await adapter.addFeedDefault(id, {
          name: 'Offline system feed',
          url: 'https://example.com/system-scope.xml',
        }),
      );
    }
    const owners = await db.query(
      'SELECT id,profile_id FROM topics WHERE id=ANY($1::uuid[]) ORDER BY id',
      [[nullTopic, foreignTopic]],
    );
    assert.equal(
      owners.rows.find((row) => row.id === nullTopic).profile_id,
      null,
    );
    assert.equal(
      owners.rows.find((row) => row.id === foreignTopic).profile_id,
      foreignProfile,
    );
    const added = await adapter.createDefault({
      ...input,
      name: 'Compatibility topic',
    });
    created.push(added.id);
    const owner = await db.query('SELECT profile_id FROM topics WHERE id=$1', [
      added.id,
    ]);
    assert.equal(
      owner.rows[0].profile_id,
      '00000000-0000-4000-8000-000000000001',
    );
    assert.equal(added.position, original.length + 2);
    const ids = (await adapter.listDefault()).map((t) => t.id).reverse();
    assert.equal(await adapter.reorderDefault(ids.slice(1)), false);
    assert.equal(await adapter.reorderDefault(ids), true);
    assert.deepEqual(
      (await adapter.listDefault()).map((t) => t.id),
      ids,
    );
    assert.deepEqual(
      (await adapter.listDefault()).map((t) => t.position),
      ids.map((_, i) => i),
    );
    delete process.env.SYSTEM_OWNERSHIP;
    assert.ok((await adapter.listDefault()).some((t) => t.id === added.id));
    assert.equal((await adapter.listDefault()).length, original.length + 1);
    process.env.SYSTEM_OWNERSHIP = '1';
    assert.ok(await adapter.deleteDefault(nullTopic));
    assert.deepEqual(
      (await adapter.listDefault()).map((t) => t.position),
      Array.from({ length: original.length + 2 }, (_, i) => i),
    );
  } finally {
    process.env.SYSTEM_OWNERSHIP = '1';
    for (const id of [nullTopic, foreignTopic, ...created])
      await adapter.deleteDefault(id);
    assert.equal(await adapter.reorderDefault(original.map((t) => t.id)), true);
    delete process.env.SYSTEM_OWNERSHIP;
    assert.deepEqual(await adapter.listDefault(), original);
    if (previous !== undefined) process.env.SYSTEM_OWNERSHIP = previous;
    await db.query('DELETE FROM profiles WHERE id=$1', [foreignProfile]);
    await db.end();
    await adapter.onModuleDestroy();
  }
});
