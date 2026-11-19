import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { developingRewriteRequest } from '../src/modules/curation/application/developing-rewrite-request';
import { rewriteDevelopingStories } from '../src/modules/digests/application/rewrite-developing-stories';

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

void test('rewrite input bound counts UTF-8 and framing, retaining every byte below the exact limit', () => {
  const base = structuredClone(input);
  base.stories[0].evidence.excerpt = '';
  const empty = developingRewriteRequest(base);
  const overhead =
    Buffer.byteLength(empty.instructions + empty.prompt, 'utf8') + 2048;
  const remaining = 99999 - overhead;
  // Unicode makes a character-count check insufficient.
  const excerpt =
    '界'.repeat(Math.floor(remaining / 3)) + 'x'.repeat(remaining % 3);
  base.stories[0].evidence.excerpt = excerpt;
  const accepted = developingRewriteRequest(base);
  assert.equal(
    Buffer.byteLength(accepted.instructions + accepted.prompt, 'utf8') + 2048,
    99999,
  );
  assert.equal(
    JSON.parse(accepted.prompt).stories[0].currentEvidence.excerpt,
    excerpt,
  );
  base.stories[0].evidence.excerpt += 'x';
  assert.throws(() => developingRewriteRequest(base), /exceeds input bound/);
  base.stories[0].evidence.excerpt = '';
  base.stories[0].evidence.clusterEvidence[0].excerpt = '界'.repeat(34000);
  assert.throws(() => developingRewriteRequest(base), /exceeds input bound/);
  base.stories[0].evidence.clusterEvidence[0].excerpt = '';
  base.stories[0].earlierCoverage.previousSummary = 'x'.repeat(100000);
  assert.throws(() => developingRewriteRequest(base), /exceeds input bound/);
});

void test('oversized request preparation preserves the entire accepted selection without dispatch', async () => {
  const current = structuredClone(story);
  current.evidence.excerpt = 'x'.repeat(100000);
  const selected = [current.selected, { ...current.selected, id: 'unmatched' }];
  const before = structuredClone(selected);
  let dispatched = false;
  const result = await rewriteDevelopingStories({
    selected,
    evidence: [current.evidence],
    links: [
      {
        storyId: current.selected.id,
        previousEditionId: '00000000-0000-4000-8000-000000000001',
        previousStoryId: '00000000-0000-4000-8000-000000000002',
        previousHeadline: current.earlierCoverage.previousHeadline,
        previousSummary: current.earlierCoverage.previousSummary,
        editionCount: 2,
      },
    ],
    async rewrite(stories) {
      developingRewriteRequest({ ...input, stories });
      dispatched = true;
      return [];
    },
    validate: () => {
      throw new Error('No response to validate');
    },
  });
  assert.equal(dispatched, false);
  assert.equal(result.status, 'unchanged');
  assert.equal(result.stories, selected);
  assert.deepEqual(selected, before);
  assert.equal(current.evidence.excerpt.length, 100000);
});
