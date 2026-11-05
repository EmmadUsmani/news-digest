import assert from 'node:assert/strict';
import { test } from 'node:test';

import { viralXSearchBody } from '../src/modules/social/adapters/x-viral-search-body';
import {
  type FixedSearchTopic,
  planFixedSearchSchedule,
} from '../src/modules/social/domain/fixed-search-schedule';

const settings = {
  reactionMinFaves: 100,
  trendingMinFaves: 1000,
  exclusions: ['-odds', '-bet'],
};
const topic = (id: string, freePosts: number, count = 3): FixedSearchTopic => ({
  id,
  name: id,
  guidance: '',
  handles: [],
  freePosts,
  settings,
  stories: Array.from({ length: count }, (_, i) => ({
    id: `${id}-${i}`,
    title: `${id} story ${i}`,
    importance: i,
  })),
});
const input = {
  enabled: true,
  topics: [topic('quiet', 3, 2), topic('busy', 0, 4)],
  now: new Date('2026-11-05T14:30:00Z'),
  editionAt: new Date('2026-11-05T15:00:00Z'),
  coverageStart: new Date('2026-11-04T15:00:00Z'),
  availableMicros: 400000,
  reservationMicros: 100000,
};
void test('fixed schedule is off by default and skips outside the edition search window', () => {
  assert.deepEqual(
    planFixedSearchSchedule({ ...input, enabled: undefined }),
    [],
  );
  assert.deepEqual(planFixedSearchSchedule({ ...input, enabled: false }), []);
  for (const now of ['2026-11-05T14:29:59Z', '2026-11-05T14:56:00Z'])
    assert.deepEqual(
      planFixedSearchSchedule({ ...input, now: new Date(now) }),
      [],
    );
});
void test('one viral slot per topic; budget removes strongest free coverage first', () => {
  const keys = (availableMicros: number) =>
    planFixedSearchSchedule({ ...input, availableMicros }).map(
      ({ topicId, style }) => `${topicId}:${style}`,
    );
  assert.deepEqual(keys(400000), ['busy:trending', 'quiet:trending']);
  assert.deepEqual(keys(350000), keys(400000));
  assert.deepEqual(keys(200000), keys(400000));
  assert.deepEqual(keys(100000), ['busy:trending']);
  assert.deepEqual(keys(0), []);
});
void test('stored settings construct viral requests without headlines or handles', () => {
  const before = JSON.stringify(input);
  for (const plan of planFixedSearchSchedule(input)) {
    assert.equal(plan.request.handles, undefined);
    assert.equal(plan.scheduledDay, '2026-11-05');
    assert.deepEqual(plan.request.publicationWindow, {
      start: '2026-11-04T15:00:00.000Z',
      end: '2026-11-05T15:00:00.000Z',
    });
    const body = viralXSearchBody(plan.request, plan.settings);
    const prompt = JSON.parse(body.input[0].content.split('\n').at(-1)!);
    assert.match(
      prompt.queryTemplate,
      / -filter:replies -filter:retweets lang:en -odds -bet -giveaway min_faves:/,
    );
    assert.match(
      prompt.queryTemplate,
      /min_faves:1000 since:2026-11-04_15:00:00_UTC until:2026-11-05_15:00:00_UTC$/,
    );
    assert.match(prompt.queryTemplate, /-giveaway/);
    assert.deepEqual(plan.rankedStoryTitles, []);
  }
  assert.equal(JSON.stringify(input), before);
});
void test('missing settings skip a topic; insufficient distinct stories skip A without a replacement followup', () => {
  const short = topic('short', 0, 1);
  short.stories.push({ ...short.stories[0], id: 'duplicate-title' });
  const plans = planFixedSearchSchedule({
    ...input,
    topics: [short, { ...topic('unconfigured', 0), settings: null }],
  });
  assert.deepEqual(
    plans.map(({ topicId, style }) => [topicId, style]),
    [['short', 'trending']],
  );
});
void test('invalid budget, duplicate topics and malformed stored operators cannot produce plans', () => {
  for (const availableMicros of [-1, NaN, 0.5])
    assert.throws(() => planFixedSearchSchedule({ ...input, availableMicros }));
  assert.throws(() =>
    planFixedSearchSchedule({ ...input, reservationMicros: 0 }),
  );
  assert.throws(() =>
    planFixedSearchSchedule({
      ...input,
      topics: [input.topics[0], input.topics[0]],
    }),
  );
  assert.throws(() =>
    planFixedSearchSchedule({
      ...input,
      topics: [
        {
          ...topic('bad', 0),
          settings: { ...settings, exclusions: [' OR spam'] },
        },
      ],
    }),
  );
});
