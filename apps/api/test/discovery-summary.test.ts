import assert from 'node:assert/strict';
import { test } from 'node:test';

import { summarizeDiscovery } from '../src/modules/social/domain/discovery-summary';

type Call = Parameters<typeof summarizeDiscovery>[0][number];
const call = (overrides: Partial<Call> = {}): Call => ({
  requestedTopic: { id: 'nba', name: 'NBA' },
  searchType: 'open-topic',
  status: 'succeeded',
  costMicros: 20000,
  heldMicros: 0,
  postsFetched: 4,
  topics: [
    {
      topicId: 'nba',
      newVerifiedNow: 2,
      outsideListNewVerifiedNow: 1,
      unknownBaseline: 0,
    },
  ],
  ...overrides,
});

void test('summary keeps empty/failed calls and search types, counting call costs once', () => {
  const groups = summarizeDiscovery([
    call(),
    call({ topics: [], status: 'failed', costMicros: 1000 }),
    call({ searchType: 'account-list' }),
    call({ requestedTopic: { id: 'world', name: 'World' }, topics: [] }),
  ]);
  assert.equal(groups.length, 3);
  assert.deepEqual(groups[0], {
    topicId: 'nba',
    topicName: 'NBA',
    searchType: 'open-topic',
    calls: 2,
    succeeded: 1,
    costMicros: 21000,
    unknownCostCalls: 0,
    heldMicros: 0,
    postsFetched: 8,
    unknownFetchedCalls: 0,
    newVerifiedNow: 2,
    outsideListNewVerifiedNow: 1,
    unknownBaseline: 0,
  });
  assert.equal(groups[2].costMicros, 20000);
  assert.equal(groups[2].newVerifiedNow, 0);
});

void test('summary preserves unknown charges and does not infer historical attribution', () => {
  const groups = summarizeDiscovery([
    call({
      requestedTopic: null,
      searchType: null,
      costMicros: null,
      postsFetched: null,
      heldMicros: 100000,
      status: 'uncertain',
    }),
    call({
      topics: [
        {
          topicId: 'nba',
          newVerifiedNow: 0,
          outsideListNewVerifiedNow: 0,
          unknownBaseline: 3,
        },
        {
          topicId: 'world',
          newVerifiedNow: 7,
          outsideListNewVerifiedNow: 5,
          unknownBaseline: 0,
        },
      ],
    }),
  ]);
  assert.equal(groups[0].topicId, null);
  assert.equal(groups[0].searchType, null);
  assert.equal(groups[0].unknownCostCalls, 1);
  assert.equal(groups[0].unknownFetchedCalls, 1);
  assert.equal(groups[0].heldMicros, 100000);
  assert.equal(groups[0].newVerifiedNow, 0);
  assert.equal(groups[1].newVerifiedNow, 0);
  assert.equal(groups[1].unknownBaseline, 3);
});

void test('summary groups stable topic IDs across renames and handles no calls', () => {
  assert.deepEqual(summarizeDiscovery([]), []);
  const groups = summarizeDiscovery([
    call(),
    call({ requestedTopic: { id: 'nba', name: 'Basketball' } }),
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].calls, 2);
  assert.equal(groups[0].costMicros, 40000);
});
