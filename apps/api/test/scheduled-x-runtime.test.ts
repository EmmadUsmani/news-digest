import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ProfileSettings } from '@digest/contracts';

import { runScheduledXRuntime } from '../src/scheduled-x-runtime';

const now = new Date('2026-11-03T14:30:00Z');
const parentId = '00000000-0000-4000-8000-000000000001';

function fixture(verificationErrors = 0) {
  const events: string[] = [];
  let reservations = 0;
  const dependencies: Parameters<typeof runScheduledXRuntime>[0] = {
    profile: async () =>
      ({
        id: 'owner',
        schedule: {
          cadence: '0 15 * * *',
          timezone: 'UTC',
          coverageWindow: 'P1D',
          storyBudget: 5,
          postBudget: 5,
        },
      }) as ProfileSettings,
    searches: {
      scheduledTopics: async () => [
        {
          id: 'nba',
          name: 'NBA',
          guidance: '',
          handles: ['NBA'],
          freePosts: 0,
        },
      ],
      save: async () => {
        events.push('save');
      },
    },
    search: {
      search: async (request) => {
        events.push(
          request.reactionStory
            ? 'reaction'
            : request.handles
              ? 'accounts'
              : 'open',
        );
        return {
          links: [],
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            postsFetched: 0,
            profilesFetched: 0,
          },
        };
      },
    },
    ledger: {
      reserve: async (_model, _run, estimate, topic, day, type, parent) => {
        assert.equal(estimate, 100000);
        assert.equal(topic?.id, 'nba');
        assert.equal(day, '2026-11-03');
        if (reservations++ === 0) {
          assert.equal(parent, undefined);
          return parentId;
        }
        assert.equal(type, 'story-reactions');
        assert.equal(parent, parentId);
        return '00000000-0000-4000-8000-000000000002';
      },
      settle: async () => {
        events.push('settle');
      },
      fail: async () => {
        assert.fail('Unexpected provider failure');
      },
      completeVerification: async (id) => {
        assert.equal(id, parentId);
        events.push('complete');
      },
    },
    verify: async () => {
      events.push('verify');
      return { verificationErrors };
    },
  };
  return { dependencies, events };
}

void test('disabled or absent fixed search performs no configuration, ledger or provider work', async () => {
  for (const configured of [false, true]) {
    const { dependencies, events } = fixture();
    dependencies.profile = async () => {
      throw new Error('Must stay idle');
    };
    if (configured)
      dependencies.fixed = {
        enabled: () => false,
        settings: async () => {
          throw new Error('Must stay idle');
        },
        availableMicros: async () => {
          throw new Error('Must stay idle');
        },
      };
    assert.deepEqual(await runScheduledXRuntime(dependencies, () => now), {
      skipped: 'Fixed search disabled',
    });
    assert.deepEqual(events, []);
  }
});

void test('fixed runtime dispatches only keyword searches', async () => {
  const { dependencies, events } = fixture();
  const styles: string[] = [];
  dependencies.fixed = {
    enabled: () => true,
    settings: async () => ({
      reactionMinFaves: 100,
      trendingMinFaves: 200,
      exclusions: ['-crypto'],
    }),
    availableMicros: async () => 400000,
  };
  dependencies.ledger.reserve = async (
    _model,
    _run,
    _estimate,
    _topic,
    _day,
    type,
    parent,
  ) => {
    assert.equal(parent, undefined);
    styles.push(type!);
    return parentId;
  };
  dependencies.search.search = async (request) => {
    assert.equal(request.handles, undefined);
    assert.equal(request.reactionStory, undefined);
    assert.equal(request.fixedSearch?.settings.trendingMinFaves, 200);
    events.push(request.fixedSearch.style);
    return {
      execution: 'completed',
      links: [],
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        postsFetched: 0,
        profilesFetched: 0,
      },
    };
  };
  await runScheduledXRuntime(dependencies, () => now);
  assert.deepEqual(styles, ['fixed-trending']);
  assert.deepEqual(events, ['trending', 'settle', 'save', 'verify']);
});

void test('fixed runtime settles before linked retry and ledger refusal prevents repeat provider work', async () => {
  for (const timeout of [false, true]) {
    const { dependencies, events } = fixture();
    dependencies.fixed = {
      enabled: () => true,
      settings: async () => ({
        reactionMinFaves: 100,
        trendingMinFaves: 200,
        exclusions: [],
      }),
      availableMicros: async () => 400000,
    };
    dependencies.ledger.completeVerification = async () => {
      events.push('complete');
    };
    let admitted = 0;
    dependencies.ledger.reserve = async (
      _model,
      _run,
      _estimate,
      _topic,
      _day,
      type,
      parent,
    ) => {
      assert.equal(type, 'fixed-trending');
      events.push(parent ? 'admit-retry' : 'admit-primary');
      if (admitted >= 2) return null;
      assert.equal(parent, admitted === 0 ? undefined : parentId);
      return admitted++ === 0
        ? parentId
        : '00000000-0000-4000-8000-000000000002';
    };
    dependencies.ledger.fail = async (_id, reason) => {
      assert.equal(reason, 'uncertain');
      events.push('hold');
    };
    dependencies.search.search = async () => {
      events.push('provider');
      if (timeout) throw new Error('timeout');
      return {
        execution: 'unconfirmed',
        links: [],
        usage: {
          inputTokens: 10,
          outputTokens: 2,
          postsFetched: 0,
          profilesFetched: 0,
        },
      };
    };
    await runScheduledXRuntime(dependencies, () => now);
    assert.equal(admitted, 2);
    assert.deepEqual(
      events,
      timeout
        ? [
            'admit-primary',
            'provider',
            'hold',
            'admit-retry',
            'provider',
            'hold',
          ]
        : [
            'admit-primary',
            'provider',
            'settle',
            'save',
            'verify',
            'admit-retry',
            'provider',
            'settle',
            'save',
            'verify',
          ],
    );
    events.length = 0;
    await runScheduledXRuntime(dependencies, () => now);
    assert.deepEqual(events, ['admit-primary']);
  }
});
