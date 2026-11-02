import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  assessPostEligibility,
  assessPostSafety,
} from '../src/modules/social/domain/eligibility';

void test('semantic candidate safety allows empty positive rules but retains time and explicit exclusions', () => {
  const start = new Date('2026-11-01T00:00:00Z');
  const end = new Date('2026-11-02T00:00:00Z');
  const policy = { includeAny: [], excludeAny: ['celebrity gossip'] };
  const post = {
    text: 'Eyewitness account of election protests',
    publishedAt: start.toISOString(),
  };
  assert.equal(assessPostSafety(post, policy, start, end).eligible, true);
  assert.equal(assessPostEligibility(post, policy, start, end).eligible, false);
  for (const changed of [
    { ...post, publishedAt: null },
    { ...post, publishedAt: end.toISOString() },
    { ...post, text: '' },
    { ...post, text: 'Celebrity gossip update' },
    { ...post, text: 'Retweet to win tickets' },
  ])
    assert.equal(assessPostSafety(changed, policy, start, end).eligible, false);
});
