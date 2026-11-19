import assert from 'node:assert/strict';
import { test } from 'node:test';

import { savedEditorialEvidence } from '../scripts/saved-editorial-evidence';

const representative = {
  id: 'a',
  title: 'Original title',
  excerpt: 'Original 日本語',
  sources: ['Source'],
  publisher: 'Publisher',
  url: 'https://example.com/a',
};
const supplemental = {
  id: 'b',
  title: 'Follow-up',
  excerpt: null,
  sources: ['Other'],
  publisher: null,
};
const prompt = (candidates: unknown[], topic = 'topic') =>
  JSON.stringify({ topic: { id: topic }, candidates });

void test('saved evidence preserves original input and restores representative before supplemental evidence', () => {
  const raw = prompt([
    {
      ...representative,
      earlierCoverage: { headline: 'History' },
      clusterEvidence: [supplemental],
    },
  ]);
  const result = savedEditorialEvidence(raw, 'topic', ['a']);
  assert.ok(result);
  assert.equal(result.evidence[0].title, representative.title);
  assert.equal(result.evidence[0].excerpt, representative.excerpt);
  assert.deepEqual(result.evidence[0].publisher, {
    name: 'Publisher',
    url: null,
  });
  assert.deepEqual(
    result.evidence[0].clusterEvidence?.map(({ id }) => id),
    ['a', 'b'],
  );
  assert.equal(result.evidence[0].earlierCoverage, undefined);
  assert.match(result.promptSha256, /^[a-f0-9]{64}$/);
  assert.notEqual(
    result.promptSha256,
    savedEditorialEvidence(raw + ' ', 'topic', ['a'])?.promptSha256,
  );
});

void test('missing, malformed, ambiguous or wrong-topic evidence refuses the entire capture', () => {
  for (const raw of [
    undefined,
    'invalid',
    prompt([representative], 'other'),
    prompt([representative, representative]),
    prompt([{ ...representative, excerpt: 5 }]),
    prompt([{ ...representative, clusterEvidence: [representative] }]),
  ])
    assert.equal(savedEditorialEvidence(raw, 'topic', ['a']), null);
  assert.equal(
    savedEditorialEvidence(prompt([representative]), 'topic', ['a', 'missing']),
    null,
  );
  assert.equal(
    savedEditorialEvidence(prompt([representative]), 'topic', ['a', 'a']),
    null,
  );
  assert.deepEqual(
    savedEditorialEvidence(
      prompt([representative, { ...representative, id: 'b' }]),
      'topic',
      ['b', 'a'],
    )?.evidence.map(({ id }) => id),
    ['b', 'a'],
  );
});
