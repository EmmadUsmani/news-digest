import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import { sameEvent } from '../src/modules/digests/domain/cluster';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { sameEventWithStudioClosure } from '../src/modules/digests/domain/studio-event';

const item = (title: string): Candidate => ({
  id: title,
  title,
  excerpt: '',
  publishedAt: '2026-11-02T12:00:00Z',
  url: 'https://example.org',
  sources: ['Example'],
  points: 0,
});

void test('studio closure requires an explicit matching entity and assertion within the window', () => {
  const lead = item('Copper Studio shuts down after funding cuts');
  const other = item('Copper Studio is closed');
  assert.equal(sameEvent(lead, other), false);
  assert.equal(sameEventWithStudioClosure(lead, other), true);
  for (const candidate of [
    item('Silver Studio is closed'),
    item('Silver Copper Studio is closed'),
    item('Copper Studio loses funding'),
    item('Copper Studio game cancelled'),
    item('Copper Studio is not closed'),
    item('Rumor: Copper Studio is closed'),
    item('Copper Studio is closed but reopens tomorrow'),
    item('Copper Studio is closed and Silver Studio is closed'),
    { ...other, publishedAt: '2026-11-05T12:00:00Z' },
    { ...other, publishedAt: 'invalid' },
  ]) {
    assert.equal(
      sameEventWithStudioClosure(lead, candidate),
      false,
      candidate.title,
    );
    assert.equal(
      sameEventWithStudioClosure(candidate, lead),
      false,
      candidate.title,
    );
  }
});

void test('recorded studio closure improves Gaming recall with fully labeled cluster merges', () => {
  const result = evaluateEventGrouping(sameEventWithStudioClosure);
  assert.equal(result.truePositives, 13);
  assert.equal(result.falsePositives, 0);
  for (const window of result.windows) {
    assert.equal(window.membership.unlabeledMergedPairs, 0);
    assert.equal(window.membership.falsePositives, 0);
    assert.equal(window.membership.orderSensitivePairs, 0);
  }
});

void test('studio closure does not infer current events from questions, uncertainty or retrospectives', () => {
  const current = item('Copper Studio is closed');
  for (const title of [
    'Copper Studio is closed?',
    'Copper Studio is closed？',
    'If Copper Studio is closed, who owns the games?',
    'Copper Studio is closed, allegedly',
    'Copper Studio is reportedly closed',
    'Copper Studio is closed unless new funding arrives',
    'Copper Studio is closed: what would happen to its games?',
    'Copper Studio was closed years ago',
    'Copper Studio was closed last year',
    'Copper Studio was closed in 2020',
    'Copper Studio was closed on October 31, 2020',
    'Copper Studio was previously closed',
    'Copper Studio is closed in a plan expected to take effect tomorrow',
  ]) {
    const uncertain = item(title);
    assert.equal(sameEventWithStudioClosure(current, uncertain), false, title);
    assert.equal(sameEventWithStudioClosure(uncertain, current), false, title);
    // Identical uncertain titles must not fall through to lexical matching.
    assert.equal(
      sameEventWithStudioClosure(uncertain, uncertain),
      false,
      title,
    );
  }
  assert.equal(
    sameEventWithStudioClosure(current, {
      ...item('Remembering the developer'),
      excerpt: 'Copper Studio was closed years ago.',
    }),
    false,
  );
  assert.equal(
    sameEventWithStudioClosure(current, {
      ...current,
      excerpt: 'Founded in 2021, the studio has shut its doors.',
    }),
    true,
  );
});
