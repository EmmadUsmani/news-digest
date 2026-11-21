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

void test('saved E1 delay rewrite preserves the diplomats denial and caretaker-government qualification', async () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/developing-stories-world-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as {
    cases: {
      topicName: string;
      selected: {
        id: string;
        title: string;
        summary: string;
        whyItMatters: string;
      }[];
      originalEditorialEvidence: { evidence: EditorialCandidate[] };
      history: {
        editionId: string;
        stories: { id: string; title: string; summary: string }[];
      }[];
    }[];
  };
  const item = fixture.cases[0];
  const id = '0f1db589-579f-43ff-b62f-a19541eb610e';
  const current = item.originalEditorialEvidence.evidence.find(
    (s) => s.id === id,
  )!;
  assert.match(
    current.excerpt!,
    /Israeli diplomats insisted the move was not in response/,
  );
  assert.match(
    current.excerpt!,
    /should not be taken by the caretaker government/,
  );
  const history = item.history.find((h) =>
    h.stories.some((s) => s.id === '31358d6e-138b-4560-bc14-a59b86990a10'),
  )!;
  const previous = history.stories.find(
    (s) => s.id === '31358d6e-138b-4560-bc14-a59b86990a10',
  )!;
  // Manual source review: chronology does not establish sanctions causality.
  // Both qualifications are in the bounded current excerpt, not inherited history.
  const rewrite = {
    id,
    title:
      'Israel postpones E1 settlement contracts; diplomats deny UK sanctions prompted delay',
    summary:
      'Israel has postponed issuing contracts for a large West Bank settlement days after UK sanctions on building firms in the area. Israeli diplomats insisted the move was not in response to the measures from Downing Street. Attorney general Gali Baharav-Miara objects to the caretaker government led by Benjamin Netanyahu deciding settlement expansion.',
    whyItMatters:
      'The E1 settlement is seen as likely to render a two-state solution unviable.',
  };
  // The existing conservative guard requires the complete attributed denial.
  for (const denial of [
    'The move was not in response to the measures from Downing Street.',
    'Israeli diplomats insisted the move was not in response to the UK measures.',
  ]) {
    assert.equal(
      validateDevelopingRewrite(
        { ...rewrite, summary: denial },
        current,
        item.topicName,
      ),
      false,
    );
  }
  const result = await rewriteDevelopingStories({
    selected: item.selected,
    evidence: item.originalEditorialEvidence.evidence,
    links: [
      {
        storyId: id,
        previousEditionId: history.editionId,
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
  const updated = result.stories.find((s) => s.id === id)!;
  assert.equal(updated.summary, rewrite.summary);
  assert.equal(updated.whyItMatters, rewrite.whyItMatters);
  assert.deepEqual(
    result.stories.filter((s) => s.id !== id),
    item.selected.filter((s) => s.id !== id),
  );
});

void test('saved summit greeting rewrite excludes inherited agenda and outcome claims', async () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/developing-stories-world-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as {
    cases: {
      topicName: string;
      selected: {
        id: string;
        title: string;
        summary: string;
        whyItMatters: string;
      }[];
      originalEditorialEvidence: { evidence: EditorialCandidate[] };
      history: {
        editionId: string;
        stories: { id: string; title: string; summary: string }[];
      }[];
    }[];
  };
  const item = fixture.cases[0];
  const current = item.originalEditorialEvidence.evidence[0];
  const previousId = 'd5872a78-a690-4dae-a7a2-bebc16cb35f9';
  const history = item.history.find((h) =>
    h.stories.some((s) => s.id === previousId),
  )!;
  const previous = history.stories.find((s) => s.id === previousId)!;
  assert.equal(current.id, '2e56befe-11d4-4fd2-85d6-9a5251af2b92');
  assert.equal(
    current.excerpt,
    'The three leaders will meet together for the first time on Thursday during a closely-watched summit.',
  );
  // Manual source review: the current title supports the greeting; the excerpt
  // supports the prospective meeting. Earlier agenda hopes are not new facts.
  const rewrite = {
    id: current.id,
    title: 'Trump shakes hands with Putin and Xi ahead of talks in China',
    summary:
      'Trump shakes hands with Putin and Xi ahead of talks in China. The three leaders will meet together for the first time on Thursday during a closely-watched summit.',
    whyItMatters:
      'The summit brings the three leaders together for the first time.',
  };
  const result = await rewriteDevelopingStories({
    selected: item.selected,
    evidence: item.originalEditorialEvidence.evidence,
    links: [
      {
        storyId: current.id,
        previousEditionId: history.editionId,
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
  assert.equal(result.stories[0].summary, rewrite.summary);
  assert.deepEqual(result.stories.slice(1), item.selected.slice(1));
});
