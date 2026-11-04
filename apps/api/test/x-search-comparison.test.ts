import assert from 'node:assert/strict';
import { test } from 'node:test';

import { xSearchBody } from '../src/modules/social/adapters/x-search';
import { xSearchComparisonBody } from '../src/modules/social/adapters/x-search-comparison';

const request = {
  topic: 'NBA',
  guidance: 'Fixture guidance',
  fromDate: '2026-11-03',
  toDate: '2026-11-04',
};
const settings = {
  reactionMinFaves: 100,
  trendingMinFaves: 1000,
  exclusions: ['-odds', '-parlay', '-picks', '-bet'],
};
const titles = ['Fixture trade announcement', 'Fixture game result'];

void test('comparison preserves the exact current baseline and provider window', () => {
  assert.deepEqual(
    xSearchComparisonBody(request, 'current', settings, []),
    xSearchBody(request),
  );
  const body = xSearchComparisonBody(request, 'trending', settings, []);
  assert.deepEqual(body.tools, xSearchBody(request).tools);
  assert.equal(body.model, 'grok-4.3');
  assert.equal(body.max_turns, 2);
  assert.equal(body.store, false);
});

void test('comparison fixes operators and thresholds independently of keyword data', () => {
  for (const style of ['trending', 'reactions'] as const) {
    const body = xSearchComparisonBody(request, style, settings, titles);
    const content = body.input[0].content;
    const data = JSON.parse(content.slice(content.indexOf('\n') + 1));
    assert.equal(
      data.suffix,
      '-filter:replies -filter:retweets lang:en -odds -parlay -picks -bet min_faves:' +
        (style === 'reactions' ? 100 : 1000),
    );
    assert.deepEqual(
      data.rankedStoryTitles,
      style === 'reactions' ? titles : undefined,
    );
    assert.match(content, /x_keyword_search in Top mode/);
    if (style === 'reactions') assert.match(content, /joined with OR/);
    assert.deepEqual(data.publicationWindow, {
      start: '2026-11-03T00:00:00.000Z',
      end: '2026-11-04T00:00:00.000Z',
    });
  }
});

void test('comparison rejects unsafe operators, missing stories and invalid bounds before spending', () => {
  for (const exclusions of [
    ['-bet OR spam'],
    ['min_faves:0'],
    ['-bet\nlang:all'],
  ])
    assert.throws(() =>
      xSearchComparisonBody(
        request,
        'trending',
        { ...settings, exclusions },
        [],
      ),
    );
  for (const reactionMinFaves of [-1, 0.5, NaN, Infinity])
    assert.throws(() =>
      xSearchComparisonBody(
        request,
        'reactions',
        { ...settings, reactionMinFaves },
        titles,
      ),
    );
  for (const stories of [
    [],
    ['only one'],
    [...titles, 'third', 'fourth'],
    ['', 'second'],
  ])
    assert.throws(() =>
      xSearchComparisonBody(request, 'reactions', settings, stories),
    );
  assert.throws(() =>
    xSearchComparisonBody(
      { ...request, toDate: request.fromDate },
      'trending',
      settings,
      [],
    ),
  );
  assert.throws(() =>
    xSearchComparisonBody(
      { ...request, handles: ['NBA'] },
      'current',
      settings,
      [],
    ),
  );
});

void test('comparison carries exact publication window and permits explicit zero thresholds', () => {
  const publicationWindow = {
    start: '2026-11-03T15:00:00Z',
    end: '2026-11-03T20:00:00Z',
  };
  const body = xSearchComparisonBody(
    { ...request, publicationWindow },
    'trending',
    { ...settings, trendingMinFaves: 0, exclusions: [] },
    [],
  );
  const content = body.input[0].content;
  const data = JSON.parse(content.slice(content.indexOf('\n') + 1));
  assert.deepEqual(data.publicationWindow, publicationWindow);
  assert.equal(
    data.suffix,
    '-filter:replies -filter:retweets lang:en min_faves:0',
  );
});
