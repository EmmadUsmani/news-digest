import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ProfileSettings } from '@digest/contracts';

import {
  fixedXSearchEnabled,
  runScheduledFixedXSearch,
} from '../src/scheduled-fixed-x-search';

function fixture() {
  let instant = new Date('2026-11-04T14:30:00Z');
  let balance = 400000;
  const calls: string[] = [];
  const profile = {
    id: 'owner',
    schedule: {
      cadence: '0 15 * * *',
      timezone: 'UTC',
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  } as ProfileSettings;
  const topics = ['busy', 'quiet'].map((id, index) => ({
    id,
    name: id,
    guidance: '',
    handles: [],
    freePosts: 0,
    settings: { reactionMinFaves: 10, trendingMinFaves: 20, exclusions: [] },
    stories: Array.from({ length: 3 - index }, (_, i) => ({
      id: `${id}-${i}`,
      title: `${id} story ${i}`,
      importance: 10 - i,
    })),
  }));
  const deps: Parameters<typeof runScheduledFixedXSearch>[0] = {
    enabled: () => true,
    profile: async () => profile,
    topics: async (start, end) => {
      assert.equal(start.toISOString(), '2026-11-03T15:00:00.000Z');
      assert.equal(end.toISOString(), '2026-11-04T14:30:00.000Z');
      return topics;
    },
    availableMicros: async () => balance,
    execute: async (plan) => {
      calls.push(`${plan.topicId}:${plan.style}`);
      balance -= 100000;
    },
    clock: () => instant,
  };
  return {
    deps,
    calls,
    topics,
    setBalance: (value: number) => {
      balance = value;
    },
    advance: () => {
      instant = new Date('2026-11-04T14:56:00Z');
    },
  };
}

void test('fixed schedule defaults off with no dependency reads', async () => {
  assert.equal(fixedXSearchEnabled({}), false);
  assert.equal(fixedXSearchEnabled({ X_FIXED_SEARCH_ENABLED: 'true' }), false);
  assert.equal(fixedXSearchEnabled({ X_FIXED_SEARCH_ENABLED: '1' }), true);
  const { deps } = fixture();
  deps.enabled = () => false;
  deps.profile = async () => {
    throw new Error('Must stay idle');
  };
  assert.deepEqual(await runScheduledFixedXSearch(deps), {
    skipped: 'Fixed search disabled',
  });
});

void test('one slot per topic fits the cap and respects free coverage priority', async () => {
  const { deps, calls, setBalance } = fixture();
  setBalance(300000);
  await runScheduledFixedXSearch(deps);
  assert.deepEqual(calls, ['busy:trending', 'quiet:trending']);
});

void test('live balance after settlement stops the next topic', async () => {
  const { deps, calls, setBalance } = fixture();
  setBalance(100000);
  deps.execute = async (plan) => {
    calls.push(`${plan.topicId}:${plan.style}`);
    if (plan.style === 'trending') setBalance(0);
  };
  await runScheduledFixedXSearch(deps);
  assert.deepEqual(calls, ['busy:trending']);
});

void test('slow calls stop at window boundary; changed thresholds stop remaining calls', async () => {
  for (const change of ['clock', 'settings'] as const) {
    const { deps, calls, topics, advance } = fixture();
    deps.execute = async (plan) => {
      calls.push(plan.style);
      if (change === 'clock') advance();
      else topics[0].settings.reactionMinFaves++;
    };
    await runScheduledFixedXSearch(deps);
    assert.deepEqual(calls, ['trending']);
  }
});
