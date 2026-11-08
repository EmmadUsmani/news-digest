import assert from 'node:assert/strict';
import { test } from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import {
  selectXPosts,
  type XSelectionCandidate,
} from '../src/modules/social/application/select-x-posts';

const start = new Date('2026-11-07T00:00:00Z');
const end = new Date('2026-11-08T00:00:00Z');
const policy = relevancePolicySchema.parse({
  includeAny: ['AI'],
  excludeAny: [],
});
const candidate = (
  id: string,
  text: string,
  publishedAt = start,
): XSelectionCandidate => ({
  externalId: id,
  url: `https://x.com/fixture/status/${id}`,
  author: 'Synthetic fixture',
  authorUrl: 'https://x.com/fixture',
  publishedAt,
  embedHtml: `<blockquote><p>${text}</p>AI footer</blockquote>`,
  metrics: {},
});

void test('isolated candidates retain official text and reject unsafe, out-of-window and footer-only matches', () => {
  const rows = [
    candidate('1', 'AI demo<br>https://example.org/demo'),
    candidate('2', 'Unrelated announcement'),
    candidate('3', 'AI crypto promotion'),
    candidate('4', 'AI outside window', end),
    candidate('5', 'AI too early', new Date(start.getTime() - 1)),
  ];
  const posts = selectXPosts(rows, policy, start, end, 5);
  assert.deepEqual(
    posts.map((p) => p.externalId),
    ['1'],
  );
  assert.equal(posts[0].text, 'AI demo');
  assert.equal(posts[0].displayText, 'AI demo\nhttps://example.org/demo');
  assert.deepEqual(posts[0].metrics, {});
  assert.equal(posts[0].xTriageEvidence?.reportedLikes, undefined);
});

void test('semantic candidates relax positive phrases but retain safety, time and duplicate gates', () => {
  const rows = [
    candidate('1', 'New model demonstration'),
    candidate('2', 'New model demonstration'),
    candidate('3', 'crypto launch'),
    candidate('4', 'Other event', end),
  ];
  assert.deepEqual(selectXPosts(rows, policy, start, end, 200), []);
  assert.deepEqual(
    selectXPosts(rows, policy, start, end, 200, 'semantic-candidates').map(
      (p) => p.externalId,
    ),
    ['1'],
  );
  assert.deepEqual(
    selectXPosts(rows, policy, start, end, 0, 'semantic-candidates'),
    [],
  );
});

void test('isolated ranking is deterministic, bounded and leaves input candidates unchanged', () => {
  const rows = Array.from({ length: 205 }, (_, i) =>
    candidate(String(i).padStart(3, '0'), `AI demonstration ${i}`),
  ).reverse();
  const original = structuredClone(rows);
  assert.equal(selectXPosts(rows, policy, start, end, 1000).length, 20);
  assert.equal(
    selectXPosts(rows, policy, start, end, 1000, 'semantic-candidates').length,
    200,
  );
  assert.deepEqual(
    selectXPosts(rows, policy, start, end, 2).map((p) => p.externalId),
    ['000', '001'],
  );
  assert.deepEqual(rows, original);
});
