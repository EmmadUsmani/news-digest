import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import { samePreloadOverview } from '../src/modules/digests/domain/preload-event';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { sameEventWithStudioClosure } from '../src/modules/digests/domain/studio-event';

const item = (title: string): Candidate => ({
  id: title,
  title,
  excerpt: '',
  publishedAt: '2026-11-03T12:00:00Z',
  url: 'https://example.org',
  sources: ['Fixture'],
  points: 0,
});

void test('preload overviews require the same game and a bounded unqualified schedule', () => {
  const lead = item(
    'Example Quest 6 Pre-Load Times, Install Size, And Global Release Times Confirmed',
  );
  assert.equal(
    samePreloadOverview(
      lead,
      item('Example Quest 6 preload date and times confirmed'),
    ),
    true,
  );
  assert.equal(
    samePreloadOverview(
      item('Example Quest 6 preload dates on PS4'),
      item('Example Quest 6 preload dates on PS5'),
    ),
    false,
  );
  for (const other of [
    item('Example Quest 7 preload date and times confirmed'),
    item('Other Quest 6 preload date and times confirmed'),
    item('Example Quest 6 preload date delayed'),
    item('Example Quest 6 preload date not confirmed'),
    item('Example Quest 6 preload date confirmed?'),
    item('Example Quest 6 preload date confirmed last year'),
    item('Example Quest 6 preload date is November 10'),
    item('Example Quest 6 preload date and trailer confirmed'),
    item('Example Quest 6 release date and times confirmed'),
    { ...lead, excerpt: 'The schedule might change.' },
    { ...lead, publishedAt: 'invalid' },
    { ...lead, publishedAt: '2026-11-05T12:00:00Z' },
  ]) {
    assert.equal(samePreloadOverview(lead, other), false, other.title);
    assert.equal(samePreloadOverview(other, lead), false, other.title);
  }
});

void test('preload platforms preserve hardware variants and normalize equivalent mentions', () => {
  const overview = (platform: string) =>
    item(`Example Quest preload dates on ${platform}`);
  for (const [left, right] of [
    ['PS5', 'PS5 Pro'],
    ['PlayStation 5 Pro', 'PS5'],
    ['Xbox Series X', 'Xbox Series S'],
    ['Xbox One', 'Xbox Series X'],
    ['Switch', 'Switch 2'],
    ['PC and PS5', 'PC'],
  ]) {
    assert.equal(samePreloadOverview(overview(left), overview(right)), false);
    assert.equal(samePreloadOverview(overview(right), overview(left)), false);
  }
  for (const [left, right] of [
    ['PS5', 'PlayStation 5'],
    ['PS5 Pro', 'PlayStation 5 Pro'],
    ['PS5 and PS5', 'PS5'],
    ['PS5 and PC', 'PC and PlayStation 5'],
    ['Switch 2', 'Switch 2'],
  ]) {
    assert.equal(samePreloadOverview(overview(left), overview(right)), true);
    assert.equal(samePreloadOverview(overview(right), overview(left)), true);
  }
});

void test('opt-in preload rule improves recorded recall without unknown or incorrect cluster merges', () => {
  const result = evaluateEventGrouping(sameEventWithStudioClosure);
  assert.equal(result.falsePositives, 0);
  assert.equal(result.truePositives, 22);
  for (const window of result.windows) {
    assert.equal(window.membership.permutationCheck.maxFalsePositives, 0);
    assert.equal(window.membership.permutationCheck.maxUnlabeledMergedPairs, 0);
    assert.equal(window.membership.permutationCheck.orderSensitivePairs, 0);
  }
});
