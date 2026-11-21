import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

void test('saved Kerch second-day rewrite retains all five selections with only current source facts', async () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/developing-stories-saved-2026-11-12-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as {
    cases: {
      topicName: string;
      windowEnd: string;
      selected: {
        id: string;
        title: string;
        summary: string;
        whyItMatters: string;
      }[];
      originalEditorialEvidence?: { evidence: EditorialCandidate[] };
      history: {
        editionId: string;
        stories: { id: string; title: string; summary: string }[];
      }[];
    }[];
  };
  const item = fixture.cases.find(
    (c) =>
      c.topicName === 'World news & politics' &&
      c.windowEnd.startsWith('2026-11-17'),
  )!;
  const current = item.originalEditorialEvidence!.evidence[0];
  assert.equal(current.id, '3806d892-e21b-4884-98be-e43b55e3ad7a');
  assert.equal(
    current.excerpt,
    'Ukraine has struck the Kerch Bridge linking Russia to Russian-annexed Crimea for a second day.',
  );
  const previous = item.history[0].stories.find(
    (s) => s.id === '733be6fd-e052-4658-9350-db0dc72950c6',
  )!;
  const rewrite = {
    id: current.id,
    title: 'Ukraine strikes Kerch Bridge for a second day',
    summary: current.excerpt,
    whyItMatters:
      'The strike continues attacks on the bridge linking Russia to Russian-annexed Crimea.',
  };
  // Manually reviewed entailment: actor/action, crossing/location, second-day
  // development. The runtime guard below is lexical, not an entailment judge.
  const result = await rewriteDevelopingStories({
    selected: item.selected,
    evidence: item.originalEditorialEvidence!.evidence,
    links: [
      {
        storyId: current.id,
        previousEditionId: item.history[0].editionId,
        previousStoryId: previous.id,
        previousHeadline: previous.title,
        previousSummary: previous.summary,
        editionCount: 2,
      },
    ],
    rewrite: async (inputs) => {
      assert.equal(inputs.length, 1);
      assert.deepEqual(inputs[0].evidence, current);
      assert.equal(inputs[0].earlierCoverage.previousSummary, previous.summary);
      return [rewrite];
    },
    validate: (value, evidence) =>
      validateDevelopingRewrite(value, evidence, item.topicName),
  });
  assert.equal(result.status, 'rewritten');
  assert.deepEqual(
    result.stories.map((s) => s.id),
    item.selected.map((s) => s.id),
  );
  assert.equal(result.stories[0].summary, current.excerpt);
  assert.deepEqual(result.stories.slice(1), item.selected.slice(1));
});
