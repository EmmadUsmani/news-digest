import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { developingRewriteRequest } from '../src/modules/curation/application/developing-rewrite-request';

const story = {
  selected: {
    id: 'a',
    title: 'Accepted',
    summary: 'Accepted summary',
    whyItMatters: 'Significance',
  },
  evidence: {
    id: 'a',
    title: 'Current reporting',
    excerpt: 'Current evidence',
    sources: ['Publisher'],
    earlierCoverage: { headline: 'Injected history', summary: 'Do not send' },
    clusterEvidence: [
      {
        id: 'member',
        title: 'Corroboration',
        excerpt: 'Member evidence',
        sources: ['Second publisher'],
        publisher: 'Second publisher',
      },
    ],
  },
  earlierCoverage: {
    previousHeadline: 'Validated history',
    previousSummary: 'Comparison only',
    previousStoryId: 'private-link-id',
  },
};
const input = {
  model: llmConfig({}).sonnet,
  topicId: 'topic',
  runId: 'offline',
  stories: [story],
};

void test('rewrite request isolates current evidence and validated comparison without changing selection', () => {
  const before = structuredClone(input);
  const request = developingRewriteRequest(input);
  const payload = JSON.parse(request.prompt);
  assert.equal(payload.stories[0].selected.id, 'a');
  assert.deepEqual(
    payload.stories[0].currentEvidence.clusterEvidence,
    story.evidence.clusterEvidence,
  );
  assert.equal(payload.stories[0].currentEvidence.earlierCoverage, undefined);
  assert.deepEqual(payload.stories[0].earlierCoverage, {
    headline: 'Validated history',
    summary: 'Comparison only',
  });
  assert.equal(request.prompt.includes('private-link-id'), false);
  assert.match(request.instructions, /currentEvidence alone/);
  assert.match(request.instructions, /return null/);
  assert.equal(request.purpose, 'developing-rewrite');
  assert.equal(request.maxOutputTokens, 800);
  request.model.id = 'mutation';
  assert.deepEqual(input, before);
  const ten = Array.from({ length: 10 }, (_, index) => ({
    ...story,
    selected: { ...story.selected, id: String(index) },
    evidence: { ...story.evidence, id: String(index) },
  }));
  const batch = developingRewriteRequest({ ...input, stories: ten });
  assert.equal(batch.maxOutputTokens, 8000);
  assert.deepEqual(
    JSON.parse(batch.prompt).stories.map(
      (item: { selected: { id: string } }) => item.selected.id,
    ),
    ten.map((item) => item.selected.id),
  );
});

void test('rewrite request rejects empty, oversized, ambiguous or mismatched selections', () => {
  for (const stories of [
    [],
    [story, story],
    Array(11).fill(story),
    [{ ...story, evidence: { ...story.evidence, id: 'wrong' } }],
    [
      {
        ...story,
        selected: { ...story.selected, id: ' ' },
        evidence: { ...story.evidence, id: ' ' },
      },
    ],
  ]) {
    assert.throws(
      () => developingRewriteRequest({ ...input, stories }),
      /unique matched selections/,
    );
  }
});
