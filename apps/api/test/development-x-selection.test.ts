import assert from 'node:assert/strict';
import { test } from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import { developmentXSelection } from '../src/development-x-selection';
import { xSearchBody } from '../src/modules/social/adapters/x-search';

void test('private X selection refuses disabled runtime and skips unconfigured/zero-budget topics', async () => {
  assert.throws(
    () => developmentXSelection(null, 'edition', async () => null),
    /disabled/,
  );
  let loads = 0;
  const select = developmentXSelection(
    {
      search: async () => {
        throw new Error('Unexpected provider call');
      },
    },
    'edition',
    async () => {
      loads++;
      return null;
    },
  );
  const input = {
    topicId: 'topic',
    name: 'Tech',
    guidance: 'AI',
    policy: relevancePolicySchema.parse({ includeAny: ['AI'], excludeAny: [] }),
    start: new Date('2026-11-07T00:00:00Z'),
    end: new Date('2026-11-08T00:00:00Z'),
    budget: 0,
  };
  assert.deepEqual(await select(input), { posts: [], candidates: [] });
  assert.equal(loads, 0);
  assert.deepEqual(await select({ ...input, budget: 2 }), {
    posts: [],
    candidates: [],
  });
  assert.equal(loads, 1);
});

void test('private X selection composes fixed recipe, one search and independent fallback/editor pools', async () => {
  let searches = 0;
  let verifies = 0;
  const select = developmentXSelection(
    {
      search: async (request, attempt) => {
        searches++;
        assert.equal(attempt, 'edition:search:1');
        assert.equal(request.fixedSearch?.settings.trendingMinFaves, 42);
        assert.deepEqual(request.fixedSearch?.rankedStoryTitles, []);
        assert.equal(xSearchBody(request).max_turns, 2);
        assert.deepEqual(request.publicationWindow, {
          start: '2026-11-07T00:00:00.000Z',
          end: '2026-11-08T00:00:00.000Z',
        });
        return {
          status: 'complete',
          mustReport: false,
          value: {
            usage: {
              inputTokens: 1,
              outputTokens: 1,
              postsFetched: 1,
              profilesFetched: 0,
            },
            links: [{ externalId: '1', url: 'https://x.com/fixture/status/1' }],
          },
        };
      },
    },
    'edition',
    async () => ({
      reactionMinFaves: 0,
      trendingMinFaves: 42,
      exclusions: ['-crypto'],
    }),
    {
      verify: async (externalId) => {
        verifies++;
        return {
          platform: 'x',
          externalId,
          url: 'https://x.com/fixture/status/1',
          author: 'Fixture',
          authorUrl: 'https://x.com/fixture',
          publishedAt: '2026-11-07T12:00:00Z',
          embedHtml: '<blockquote><p>AI launch</p></blockquote>',
          metrics: {},
        };
      },
    },
  );
  const input = {
    topicId: 'topic',
    name: 'Tech',
    guidance: 'AI',
    policy: relevancePolicySchema.parse({ includeAny: ['AI'], excludeAny: [] }),
    start: new Date('2026-11-07T00:00:00Z'),
    end: new Date('2026-11-08T00:00:00Z'),
    budget: 1,
  };
  const first = await select(input);
  assert.equal(first.posts.length, 1);
  assert.equal(first.candidates.length, 1);
  first.posts[0].text = 'changed';
  assert.equal(first.candidates[0].text, 'AI launch');
  assert.equal((await select(input)).posts[0].text, 'AI launch');
  assert.equal(searches, 1);
  assert.equal(verifies, 1);
});
