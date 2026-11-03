import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import { sameEvent } from '../src/modules/digests/domain/cluster';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { sameEventWithStudioClosure } from '../src/modules/digests/domain/studio-event';
import { sameTitleReveal } from '../src/modules/digests/domain/title-reveal-event';

const item = (title: string): Candidate => ({
  id: title,
  title,
  excerpt: '',
  url: 'https://example.org',
  publishedAt: '2026-11-03T12:00:00Z',
  sources: ['Fixture'],
  points: 0,
});

void test('explicit title reveals match full sequel and subtitle across numeral forms', () => {
  const lead = item(
    'The Example Quest VI: Horizon – Official Name Reveal Trailer',
  );
  for (const title of [
    'Example Quest 6: Horizon is finally made official',
    "Old Quest's Successor Finally Re-Revealed as The Example Quest VI: Horizon",
    'The Example Quest 6: Horizon Title Officially Revealed, Set 5 Years After Example Quest',
  ]) {
    const other = item(title);
    assert.equal(sameTitleReveal(lead, other), true);
    assert.equal(sameTitleReveal(other, lead), true);
    assert.equal(sameEventWithStudioClosure(lead, other), true);
  }
  assert.equal(
    sameEvent(lead, item('Example Quest 6: Horizon is finally made official')),
    false,
    'lexical baseline misses the paraphrase',
  );
});

void test('title reveals reject different identities, secondary news, uncertainty and old reports', () => {
  const lead = item(
    'The Example Quest VI: Horizon – Official Name Reveal Trailer',
  );
  for (const other of [
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 7: Horizon",
    ),
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 6: Sunset",
    ),
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 6: Horizon release date",
    ),
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 6: Horizon, rumor",
    ),
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 6: Horizon in 2020",
    ),
    item(
      "Old Quest's Successor Finally Re-Revealed as Example Quest 6: Horizon years ago",
    ),
    item('Example Quest 7: Horizon is finally made official'),
    item('Other Quest 6: Horizon is finally made official'),
    item('Example Quest 6: Sunset is finally made official'),
    item('Example Quest 6: Horizon release date officially revealed'),
    item('Example Quest 6: Horizon is still years away despite reveal'),
    item('Example Quest 6: Horizon Title Officially Revealed?'),
    item('Example Quest 6: Horizon Title Officially Revealed, rumor'),
    item('Example Quest 6: Horizon Title Officially Revealed, fan concept'),
    item('Example Quest 6: Horizon Title Officially Revealed, delayed again'),
    item('Example Quest 6: Horizon Title Officially Revealed in 2020'),
    item('Example Quest 6: Horizon Title Officially Revealed, in 2020'),
    { ...lead, publishedAt: 'invalid' },
    { ...lead, publishedAt: '2026-11-05T00:00:01Z' },
  ]) {
    assert.equal(sameTitleReveal(lead, other), false, other.title);
    assert.equal(sameTitleReveal(other, lead), false, other.title);
  }
});

void test('recorded title-reveal clusters preserve labels and membership in both directions', () => {
  const result = evaluateEventGrouping(sameEventWithStudioClosure);
  assert.equal(result.truePositives, 22);
  assert.equal(result.falsePositives, 0);
  assert.deepEqual(
    evaluateEventGrouping((a, b) => sameEventWithStudioClosure(b, a)),
    result,
  );
  for (const window of result.windows) {
    assert.equal(window.membership.permutationCheck.maxFalsePositives, 0);
    assert.equal(window.membership.permutationCheck.maxUnlabeledMergedPairs, 0);
    assert.equal(window.membership.permutationCheck.orderSensitivePairs, 0);
  }
});
