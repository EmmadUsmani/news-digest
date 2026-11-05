import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DirectXSearch } from '../src/modules/social/adapters/x-search';
import { viralXSearchBody } from '../src/modules/social/adapters/x-viral-search-body';
import { planFixedSearchSchedule } from '../src/modules/social/domain/fixed-search-schedule';

const settings = {
  reactionMinFaves: 100,
  trendingMinFaves: 1000,
  exclusions: ['-odds', '-parlay', '-picks', '-bet'],
};
const request = {
  topic: 'NBA',
  guidance: 'Basketball highlights, players and teams',
  fromDate: '2026-11-03',
  toDate: '2026-11-05',
  publicationWindow: {
    start: '2026-11-03T21:00:00Z',
    end: '2026-11-04T21:00:00Z',
  },
};

void test('viral query uses description and exact code-built operators with sixteen results', () => {
  const body = viralXSearchBody(request, settings);
  const prompt = body.input[0].content;
  const data = JSON.parse(prompt.split('\n').at(-1)!);
  assert.equal(data.description, request.guidance);
  assert.equal(
    data.queryTemplate,
    '(<keywords>) -filter:replies -filter:retweets lang:en -odds -parlay -picks -bet -giveaway min_faves:1000 since:2026-11-03_21:00:00_UTC until:2026-11-04_21:00:00_UTC',
  );
  assert.match(prompt, /8–10 fresh keyword terms/);
  assert.match(prompt, /general topic words and well-known names/);
  assert.match(prompt, /OR, unquoted except multi-word/);
  assert.match(
    prompt,
    /one x_keyword_search in Top mode, requesting 16 results/,
  );
  assert.equal(body.model, 'grok-4.3');
  assert.equal(body.max_output_tokens, 4000);
});

void test('four topic reservations fit the daily cap without article pools', () => {
  const topics = ['Tech', 'NBA', 'Gaming', 'World'].map((id) => ({
    id,
    name: id,
    guidance: id,
    handles: [],
    freePosts: 0,
    settings,
    stories: [],
  }));
  const plans = planFixedSearchSchedule({
    enabled: true,
    topics,
    now: new Date('2026-11-05T14:30:00Z'),
    editionAt: new Date('2026-11-05T15:00:00Z'),
    coverageStart: new Date('2026-11-04T15:00:00Z'),
    availableMicros: 400000,
    reservationMicros: 100000,
  });
  assert.equal(plans.length, 4);
  assert.equal(new Set(plans.map((plan) => plan.topicId)).size, 4);
  assert.ok(
    plans.every(
      (plan) =>
        plan.style === 'trending' && plan.rankedStoryTitles.length === 0,
    ),
  );
});

void test('fake provider citations retain all sixteen posts for viral search; legacy remains five', async () => {
  const annotations = Array.from({ length: 17 }, (_, i) => ({
    type: 'url_citation',
    url: `https://x.com/NBA/status/${2117000000000000000n + BigInt(i)}`,
  }));
  const send: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        status: 'completed',
        usage: {
          input_tokens: 100,
          output_tokens: 100,
          server_side_tool_usage_details: {
            x_posts_fetched: 17,
            x_users_fetched: 0,
          },
        },
        output: [
          {
            type: 'message',
            role: 'assistant',
            content: [{ type: 'output_text', text: '[]', annotations }],
          },
        ],
      }),
    );
  const adapter = new DirectXSearch('fixture-key', send);
  assert.equal(
    (
      await adapter.search({
        ...request,
        fixedSearch: { style: 'trending', settings, rankedStoryTitles: [] },
      })
    ).links.length,
    16,
  );
  assert.equal((await adapter.search(request)).links.length, 5);
});
