import assert from 'node:assert/strict';
import { test } from 'node:test';

import { searchX } from '../src/modules/social/application/search-x';
import type { XDiscoveryLedger } from '../src/modules/social/domain/x-discovery-ledger.port';
import type { XSearchRequest } from '../src/modules/social/domain/x-search.port';

const parent = '00000000-0000-4000-8000-000000000001';
const request: XSearchRequest = {
  topic: 'Fixture',
  guidance: 'Demos',
  fromDate: '2026-11-02',
  toDate: '2026-11-03',
};
const price = {
  inputPerMillion: 1.25,
  outputPerMillion: 2.5,
  perPost: 0.005,
  perProfile: 0.01,
};

void test('optional execution passes durable parent admission before HTTP and preserves settlement ordering', async () => {
  for (const kind of ['story-reactions', 'account-list'] as const) {
    for (const outcome of [
      'blocked',
      'success',
      'uncertain',
      'save-failure',
    ] as const) {
      const events: string[] = [];
      const planned: XSearchRequest =
        kind === 'account-list'
          ? { ...request, handles: ['fixture'] }
          : {
              ...request,
              reactionStory: { id: 'story', title: 'Fixture launch' },
            };
      const ledger: XDiscoveryLedger = {
        reserve: async (...args) => {
          assert.deepEqual(args, [
            'grok-4.3',
            'run',
            100000,
            { id: 'topic', name: 'Fixture' },
            '2026-11-03',
            kind,
            parent,
          ]);
          events.push('reserve');
          return outcome === 'blocked' ? null : 'call';
        },
        settle: async (id) => {
          assert.equal(id, 'call');
          events.push('settle');
        },
        fail: async (id, reason) => {
          assert.equal(id, 'call');
          events.push(reason);
        },
      };
      const execute = () =>
        searchX(
          'topic',
          'run',
          planned,
          {
            search: async (actual) => {
              assert.deepEqual(actual, planned);
              events.push('http');
              if (outcome === 'uncertain') throw new Error('network');
              return {
                links: [],
                usage: {
                  inputTokens: 10,
                  outputTokens: 10,
                  postsFetched: 0,
                  profilesFetched: 0,
                },
              };
            },
          },
          ledger,
          {
            save: async () => {
              events.push('save');
              if (outcome === 'save-failure') throw new Error('database');
            },
          },
          price,
          '2026-11-03',
          parent,
        );
      if (outcome === 'save-failure') await assert.rejects(execute, /database/);
      else
        assert.equal(
          (await execute()).state,
          outcome === 'blocked'
            ? 'budget-blocked'
            : outcome === 'uncertain'
              ? 'failed'
              : 'completed',
        );
      assert.deepEqual(
        events,
        outcome === 'blocked'
          ? ['reserve']
          : outcome === 'uncertain'
            ? ['reserve', 'http', 'uncertain']
            : ['reserve', 'http', 'settle', 'save'],
      );
    }
  }
});

void test('invalid optional requests fail before ledger, HTTP or persistence', async () => {
  const forbidden = async (): Promise<never> => {
    assert.fail('Unexpected side effect');
  };
  for (const [planned, day, parentId] of [
    [request, '2026-11-03', parent],
    [{ ...request, handles: ['fixture'] }, undefined, parent],
    [{ ...request, handles: ['fixture'] }, '2026-11-03', 'bad-id'],
  ] as const) {
    await assert.rejects(
      () =>
        searchX(
          'topic',
          'run',
          planned,
          { search: forbidden },
          {
            reserve: forbidden,
            settle: forbidden,
            fail: forbidden,
          },
          { save: forbidden },
          price,
          day,
          parentId,
        ),
      /Invalid optional X search/,
    );
  }
});
