// Read local topic metadata; all search and storage ports below are fakes.
// This rehearses a proposed schedule, not production collection or post quality.
import assert from 'node:assert/strict';

import { topicSchema } from '@digest/contracts';

import { collectBlueskyTopics } from '../apps/api/src/modules/social/application/collect-bluesky-topics';
import type { BlueskyRepository } from '../apps/api/src/modules/social/domain/bluesky';
import { localAdminFetch } from './lib/local-admin-fetch';

async function main() {
  assert.equal(process.argv.length, 2, 'No arguments supported');
  const response = await localAdminFetch(
    'http://127.0.0.1:8000/api/admin/topics',
    {
      signal: AbortSignal.timeout(10000),
    },
  );
  assert(response.ok, 'Local topic metadata unavailable');
  const topics = topicSchema.array().parse(await response.json());
  const world = topics.find((topic) => topic.name === 'World news & politics');
  assert(world?.enabled && world.postBudget > 0, 'Expected active World topic');
  assert(
    !world.blueskyQuery?.trim(),
    'Revisit plan: explicit World override exists',
  );
  const original = JSON.stringify(topics);
  const queries = [
    'World news & politics',
    'Ukraine',
    'World news & politics',
    'Gaza',
  ];
  const counts = new Map<string, number>();
  const repository: BlueskyRepository = {
    store(_id, posts) {
      assert.equal(posts.length, 0);
      return Promise.resolve();
    },
    observations() {
      return Promise.reject(new Error('Unexpected observation read'));
    },
  };
  const enabled = topics
    .filter((topic) => topic.enabled && topic.postBudget > 0)
    .slice(0, 5);
  assert(enabled.some((topic) => topic.id === world.id));
  let calls = 0;
  for (let hour = 0; hour < 24; hour++) {
    const end = new Date(Date.UTC(2026, 10, 14, hour));
    const query = queries[Math.floor(end.getTime() / 3600000) % queries.length];
    let hourlyCalls = 0;
    const result = await collectBlueskyTopics(
      repository,
      {
        search(_query, start, until) {
          assert.equal(until.getTime(), end.getTime());
          assert.equal(until.getTime() - start.getTime(), 86400000);
          hourlyCalls++;
          calls++;
          return Promise.resolve([]);
        },
      },
      topics.map((topic) =>
        topic.id === world.id ? { ...topic, blueskyQuery: query } : topic,
      ),
      () => end,
    );
    assert.equal(hourlyCalls, enabled.length);
    assert.equal(
      result.topics.find((topic) => topic.topicId === world.id)?.query,
      query,
    );
    const baseline = await collectBlueskyTopics(
      repository,
      {
        search() {
          return Promise.resolve([]);
        },
      },
      topics,
      () => end,
    );
    assert.equal(
      baseline.topics.find((topic) => topic.topicId === world.id)?.query,
      queries[0],
      'Revisit plan: World fallback changed',
    );
    assert.deepEqual(
      result.topics.filter((topic) => topic.topicId !== world.id),
      baseline.topics.filter((topic) => topic.topicId !== world.id),
    );
    counts.set(query, (counts.get(query) ?? 0) + 1);
  }
  assert.equal(JSON.stringify(topics), original);
  assert.equal(calls, 24 * enabled.length);
  assert.deepEqual(
    [...counts.values()].sort((a, b) => a - b),
    [6, 6, 12],
  );
  console.log(
    JSON.stringify({
      mode: 'offline-fake-search-and-storage',
      hours: 24,
      plannedSearches: calls,
      worldQueries: Object.fromEntries(counts),
      maximumSearchPages: calls * 2,
      maximumSubmissions: calls * 50,
      otherTopicQueriesUnchanged: true,
      liveSearches: 0,
      liveWrites: 0,
    }),
  );
}
main().catch(() => {
  console.error(
    'World rotation rehearsal failed; revisit plan and local topic metadata',
  );
  process.exitCode = 1;
});
