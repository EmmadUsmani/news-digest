import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  developingEvidence,
  developingLinks,
} from '../src/modules/digests/domain/developing-links';

const current = [{ id: 'same-id', title: 'New development' }];
const history = [18, 17].map((day) => ({
  editionId: `edition-${day}`,
  publishedAt: `2026-11-${day}T15:00:00Z`,
  stories: [
    { id: 'same-id', title: `Earlier ${day}`, summary: `Facts ${day}` },
  ],
}));

void test('semantic references distinguish recurring IDs and select nearest coverage regardless of group order', () => {
  const before = structuredClone({ current, history });
  assert.equal(
    new Set(developingEvidence(current, history).map((x) => x.reference)).size,
    3,
  );
  assert.deepEqual(
    developingLinks(current, history, [
      ['history:1:0', 'current:0', 'history:0:0'],
    ]),
    [
      {
        storyId: 'same-id',
        previousEditionId: 'edition-18',
        previousStoryId: 'same-id',
        previousHeadline: 'Earlier 18',
        previousSummary: 'Facts 18',
        editionCount: 3,
      },
    ],
  );
  assert.deepEqual({ current, history }, before);
  assert.deepEqual(developingLinks(current, history, []), []);
});

void test('invalid semantic partitions fail closed including valid groups preceding an invalid group', () => {
  const valid = ['current:0', 'history:0:0'];
  for (const groups of [
    [valid, ['unknown', 'history:1:0']],
    [valid, ['history:1:0']],
    [valid, ['current:0', 'history:1:0']],
    [['current:0', 'current:0']],
  ]) {
    assert.deepEqual(developingLinks(current, history, groups), []);
  }
});

void test('ambiguous current or prior membership and historical-only groups never create a link', () => {
  const twoCurrent = [...current, { id: 'second', title: 'Different story' }];
  assert.deepEqual(
    developingLinks(twoCurrent, history, [
      ['current:0', 'current:1', 'history:0:0'],
    ]),
    [],
  );
  assert.deepEqual(
    developingLinks(current, history, [['history:0:0', 'history:1:0']]),
    [],
  );
  const ambiguous = structuredClone(history);
  ambiguous[0].stories.push({
    id: 'other',
    title: 'Another report',
    summary: 'Other facts',
  });
  assert.deepEqual(
    developingLinks(current, ambiguous, [
      ['current:0', 'history:0:0', 'history:0:1'],
    ]),
    [],
  );
  assert.deepEqual(developingLinks(current, [], []), []);
});
