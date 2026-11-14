import assert from 'node:assert/strict';
import { test } from 'node:test';

import { socialStoryContext } from '../src/modules/digests/domain/social-story-context';

void test('NBA and Tech share bounded selected-story comparison without widening story evidence', () => {
  const stories = Array.from({ length: 12 }, (_, index) => ({
    title: `${index}: ${'t'.repeat(400)}`,
    summary: index ? 's'.repeat(500) : null,
  }));
  const before = structuredClone(stories);
  for (const topic of ['NBA', ' nba ', 'Tech', 'Tech & AI']) {
    const context = socialStoryContext(topic, stories)!;
    assert.equal(context.length, 10);
    assert.equal(context[0].summary, '');
    assert.equal(context[0].title.length, 300);
    assert.equal(context[1].summary.length, 400);
    assert.equal(context[9].title, stories[9].title.slice(0, 300));
    assert.deepEqual(socialStoryContext(topic, []), []);
  }
  for (const topic of [
    'Gaming',
    'World news & politics',
    'U.S. news & politics',
    'WNBA',
  ]) {
    assert.equal(socialStoryContext(topic, stories), undefined);
  }
  assert.deepEqual(stories, before);
});
