import assert from 'node:assert/strict';
import { test } from 'node:test';

import { redditCommunitiesSchema, topicUpdateSchema } from '@digest/contracts';

import { PostgresTopicRepository } from '../src/modules/topics/database/topic.repository';

void test('Reddit community configuration rejects paths, duplicates and unbounded lists', () => {
  assert.deepEqual(redditCommunitiesSchema.parse([' nba ', 'LocalLLaMA']), [
    'nba',
    'LocalLLaMA',
  ]);
  for (const invalid of [
    ['nba', 'NBA'],
    ['r/nba'],
    ['../nba'],
    ['a'],
    ['x'.repeat(22)],
    Array.from({ length: 21 }, (_, i) => `community_${i}`),
  ]) {
    assert.equal(redditCommunitiesSchema.safeParse(invalid).success, false);
  }
  assert.deepEqual(redditCommunitiesSchema.parse([]), []);
});

void test('topic communities are seeded, persist independently, preserve on old clients and clear explicitly', async () => {
  const repository = new PostgresTopicRepository();
  let id: string | undefined;
  try {
    const original = await repository.listDefault();
    assert.deepEqual(
      original.find((t) => t.id === '00000000-0000-4000-8000-000000000012')
        ?.redditCommunities,
      ['nba'],
    );
    const input = topicUpdateSchema.parse({
      name: 'Reddit configuration fixture',
      description: '',
      includeGuidance: '',
      excludeGuidance: '',
      enabled: false,
      storyBudget: 0,
      postBudget: 0,
      relevancePolicy: { includeAny: [], excludeAny: [] },
      accounts: ['NBA'],
      redditCommunities: ['nba', 'Games'],
    });
    const created = await repository.createDefault(input);
    id = created.id;
    assert.deepEqual(created.redditCommunities, ['nba', 'Games']);
    const { redditCommunities: omitted, ...legacy } = input;
    assert.ok(omitted);
    assert.deepEqual(
      (await repository.updateDefault(id, legacy))?.redditCommunities,
      ['nba', 'Games'],
    );
    const updated = await repository.updateDefault(id, {
      ...input,
      redditCommunities: ['LocalLLaMA'],
    });
    assert.deepEqual(updated?.redditCommunities, ['LocalLLaMA']);
    assert.deepEqual(updated?.accounts, ['NBA']);
    assert.deepEqual(
      (await repository.updateDefault(id, { ...input, redditCommunities: [] }))
        ?.redditCommunities,
      [],
    );
    assert.deepEqual(
      (await repository.listDefault()).filter((t) => t.id !== id),
      original,
    );
    await repository.deleteDefault(id);
    id = undefined;
    const empty = await repository.createDefault(legacy);
    id = empty.id;
    assert.deepEqual(empty.redditCommunities, []);
  } finally {
    if (id) await repository.deleteDefault(id);
    await repository.onModuleDestroy();
  }
});
