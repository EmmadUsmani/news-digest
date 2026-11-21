import assert from 'node:assert/strict';
import { test } from 'node:test';

import { socialStoryContext } from '../src/modules/digests/domain/social-story-context';

void test('selected-story comparison is topic independent and bounded without widening story evidence', () => {
  const stories = Array.from({ length: 12 }, (_, index) => ({
    title: `${index}: ${'t'.repeat(400)}`,
    summary: index ? 's'.repeat(500) : null,
  }));
  const before = structuredClone(stories);
  const context = socialStoryContext(stories);
  assert.equal(context.length, 10);
  assert.equal(context[0].summary, '');
  assert.equal(context[0].title.length, 300);
  assert.equal(context[1].summary.length, 400);
  assert.equal(context[9].title, stories[9].title.slice(0, 300));
  assert.deepEqual(socialStoryContext([]), []);
  assert.deepEqual(stories, before);
});

void test('complete summary comparison preserves bounded evidence and marks overflow', () => {
  const stories = [400, 401, 1200, 1201].map((size) => ({
    title: 'Title',
    summary: 's'.repeat(size),
  }));
  const expanded = socialStoryContext(stories, { completeSummaries: true });
  assert.deepEqual(
    expanded.map((story) => story.summary.length),
    [400, 401, 1200, 1200],
  );
  assert.deepEqual(
    expanded.map((story) => !!story.textTruncated),
    [false, false, false, true],
  );
  assert.equal(socialStoryContext(stories)[1].textTruncated, true);
});
