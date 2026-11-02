import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

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
