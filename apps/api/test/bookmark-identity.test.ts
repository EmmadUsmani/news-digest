import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  auditBookmarkIdentity,
  type IdentityEdition,
} from '../../../scripts/lib/bookmark-identity';

function edition(
  id: string,
  stories: unknown[],
  posts: unknown[] = [],
): IdentityEdition {
  return { id, snapshot: { topics: [{ stories, posts }] } };
}
void test('identity audit distinguishes same-edition duplicates from cross-edition reuse', () => {
  const story = { id: 'persistent', url: 'https://example.org/a' };
  const once = auditBookmarkIdentity([edition('one', [story, story])]);
  assert.equal(once.stories, 2);
  assert.equal(once.storyIds.unique, 1);
  assert.equal(once.storyIds.repeatedAcrossEditions, 0);
  const reused = auditBookmarkIdentity([
    edition('one', [story]),
    edition('two', [story]),
  ]);
  assert.equal(reused.storyIds.repeatedAcrossEditions, 1);
  assert.equal(reused.storyIds.multipleCounterparts, 0);
});
void test('identity audit detects changed story IDs and reused IDs with different URLs', () => {
  const result = auditBookmarkIdentity([
    edition('one', [{ id: 'a', url: 'https://example.org/one' }]),
    edition('two', [
      { id: 'b', url: 'https://example.org/one' },
      { id: 'a', url: 'https://example.org/two' },
    ]),
  ]);
  assert.equal(result.storyUrls.multipleCounterpartsAcrossEditions, 1);
  assert.equal(result.storyIds.multipleCounterpartsAcrossEditions, 1);
});
void test('post identity includes platform and detects URL aliases without exporting content', () => {
  const result = auditBookmarkIdentity([
    edition(
      'one',
      [],
      [
        {
          platform: 'x',
          externalId: '123',
          url: 'https://x.com/old/status/123',
          text: 'private-marker',
        },
      ],
    ),
    edition(
      'two',
      [],
      [
        {
          platform: 'x',
          externalId: '123',
          url: 'https://x.com/new/status/123',
        },
        {
          platform: 'reddit',
          externalId: '123',
          url: 'https://reddit.com/123',
        },
      ],
    ),
  ]);
  assert.equal(result.postKeys.unique, 2);
  assert.equal(result.postKeys.repeatedAcrossEditions, 1);
  assert.equal(result.postKeys.multipleCounterpartsAcrossEditions, 1);
  assert.deepEqual(result.platforms, ['reddit', 'x']);
  assert.doesNotMatch(JSON.stringify(result), /private-marker|https:/);
});
void test('historical absent arrays and missing identity fields are counted safely', () => {
  const result = auditBookmarkIdentity([
    { id: 'old', snapshot: { topics: [{}] } },
    edition(
      'new',
      [null, { id: '', url: 'url' }],
      [{ platform: 'x', url: 'url' }],
    ),
  ]);
  assert.equal(result.invalidStories, 2);
  assert.equal(result.invalidPosts, 1);
  assert.equal(result.storyIds.unique, 0);
  assert.equal(result.postKeys.unique, 0);
});
