import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateDevelopingRewrite } from '../src/modules/curation/application/developing-rewrite-support';
import type { EditorialCandidate } from '../src/modules/curation/application/editor';
import { rewriteDevelopingStories } from '../src/modules/digests/application/rewrite-developing-stories';

const claim = 'The ministry says no civilians were injured.';
const candidate: EditorialCandidate = {
  id: 'current',
  title: 'Investigation continues',
  excerpt: 'Officials are investigating the incident.',
  sources: ['Reporter'],
  earlierCoverage: { headline: claim, summary: claim },
};
const prose = {
  id: candidate.id,
  title: candidate.title,
  summary: claim,
  whyItMatters: 'Officials are investigating the incident.',
};

void test('rewrite support excludes history, preserves attribution and uses bounded current cluster evidence', () => {
  assert.equal(validateDevelopingRewrite(prose, candidate, 'World'), false);
  const current = { ...candidate, excerpt: claim };
  assert.equal(validateDevelopingRewrite(prose, current, 'World'), true);
  for (const key of ['title', 'summary', 'whyItMatters'] as const) {
    assert.equal(
      validateDevelopingRewrite(
        { ...prose, [key]: 'No civilians were injured.' },
        current,
        'World',
      ),
      false,
    );
  }
  const cluster = {
    ...candidate,
    clusterEvidence: [candidate, { ...current, id: 'support' }],
  };
  assert.equal(validateDevelopingRewrite(prose, cluster, 'World'), true);
  assert.equal(
    validateDevelopingRewrite(
      prose,
      { ...current, excerpt: 'x'.repeat(600) + claim },
      'World',
    ),
    false,
  );
  for (const [key, limit] of [
    ['title', 240],
    ['summary', 1400],
    ['whyItMatters', 400],
  ] as const)
    assert.equal(
      validateDevelopingRewrite(
        { ...prose, [key]: 'x'.repeat(limit + 1) },
        current,
        'World',
      ),
      false,
    );
  assert.equal(
    validateDevelopingRewrite({ ...prose, id: 'other' }, current, 'World'),
    false,
  );
});

void test('real rewrite support guard rejects historical-only claims atomically and accepts current-supported prose', async () => {
  const selected = [
    { ...prose, summary: candidate.excerpt!, rationale: 'Keep selection' },
  ];
  const input = {
    selected,
    evidence: [candidate],
    links: [
      {
        storyId: candidate.id,
        previousEditionId: '00000000-0000-4000-8000-000000000001',
        previousStoryId: '00000000-0000-4000-8000-000000000002',
        previousHeadline: claim,
        previousSummary: claim,
        editionCount: 2,
      },
    ],
    rewrite: async () => [prose],
    validate: (value: typeof prose, evidence: EditorialCandidate) =>
      validateDevelopingRewrite(value, evidence, 'World'),
  };
  const refused = await rewriteDevelopingStories(input);
  assert.equal(refused.status, 'unchanged');
  assert.equal(refused.stories, selected);
  const accepted = await rewriteDevelopingStories({
    ...input,
    evidence: [{ ...candidate, excerpt: claim }],
  });
  assert.equal(accepted.status, 'rewritten');
  assert.equal(accepted.stories[0].summary, claim);
  assert.equal(accepted.stories[0].rationale, selected[0].rationale);
});
