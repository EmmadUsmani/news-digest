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

void test('multiword studio closures match full identities without suffix collisions', () => {
  const lead = item('Silver Copper Studio shuts down after funding cuts');
  for (const title of [
    'Silver Copper Studio is closed',
    'The Silver Copper Studio has officially shut down',
    'As Silver Copper Studio closes, staff share memories',
  ]) {
    const other = item(title);
    assert.equal(sameEventWithStudioClosure(lead, other), true, title);
    assert.equal(sameEventWithStudioClosure(other, lead), true, title);
  }
  for (const title of [
    'Copper Studio is closed',
    'Gold Copper Studio is closed',
    'Bright Silver Copper Studio is closed',
    'Silver Copper Studios is closed',
    'Silver Copper Studio is closed and Gold Studio is closed',
    'Silver Copper Studio was closed in 2020',
    'Silver Copper Studio is reportedly closed',
    'Silver Copper Studio will shut down',
  ]) {
    const other = item(title);
    assert.equal(sameEventWithStudioClosure(lead, other), false, title);
    assert.equal(sameEventWithStudioClosure(other, lead), false, title);
  }
  assert.equal(
    sameEventWithStudioClosure(lead, {
      ...item('Developer confirms closure'),
      excerpt: 'Silver Copper Studio has shut down.',
    }),
    true,
  );
});

void test('explicit closure paraphrases group while temporary and beta closures stay separate', () => {
  const lead = item('Silver Copper Studio shuts down after funding cuts');
  for (const assertion of [
    'ceases operations',
    'ceased operations',
    'has ceased operations',
    'closes its doors',
    'has closed its doors',
    'shuts its doors',
    'has officially shut its doors',
  ]) {
    const other = item(`Silver Copper Studio ${assertion}`);
    assert.equal(sameEventWithStudioClosure(lead, other), true, assertion);
    assert.equal(sameEventWithStudioClosure(other, lead), true, assertion);
    assert.equal(
      sameEventWithStudioClosure(lead, {
        ...item('Developer confirms closure'),
        excerpt: other.title,
      }),
      true,
      assertion,
    );
  }
  for (const title of [
    'Silver Copper Studio ceases operations temporarily',
    'Silver Copper Studio closes its doors for the holidays',
    'Silver Copper Studio shuts its doors for maintenance',
    'Silver Copper Studio closed its doors in 2020',
    'Silver Copper Studio ceased operations years ago',
    'Silver Copper Studio reportedly ceases operations',
    'Silver Copper Studio may cease operations',
    'Silver Copper Studio closes beta applications',
    'Silver Copper Studio closed its beta',
    'Silver Copper Studio closes submissions',
    'Gold Copper Studio ceases operations',
  ]) {
    const other = item(title);
    assert.equal(sameEventWithStudioClosure(lead, other), false, title);
    assert.equal(sameEventWithStudioClosure(other, lead), false, title);
    if (!title.startsWith('Gold')) {
      assert.equal(sameEventWithStudioClosure(other, other), false, title);
    }
  }
});
