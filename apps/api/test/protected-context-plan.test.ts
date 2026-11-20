import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedContextPlan } from '../../../scripts/lib/protected-context-plan';
import { protectedTriageObligations } from '../../../scripts/lib/protected-triage-obligations';

void test('context plan derives real triage bounds alongside zero-call grouping inventory', async () => {
  const model = {
    id: 'haiku',
    input: 1,
    output: 5,
    cacheRead: 0.1,
    cacheWrite: 1.25,
  };
  const topic = { id: 'a', name: 'Tech', description: '', guidance: '' };
  const triage = {
    model,
    kind: 'article' as const,
    args: [
      topic,
      [{ id: 'item', title: 'Launch', sources: ['Publisher'] }],
      'edition',
    ] as const,
  };
  // Mutable tuples match the production method argument types.
  const triageInput = {
    ...triage,
    args: [topic, [...triage.args[1]], 'edition'] as Parameters<
      typeof protectedTriageObligations
    >[0]['args'],
  };
  const plan: Parameters<typeof protectedContextPlan>[0] = {
    editionId: 'edition',
    topicIds: ['a'],
    expected: [
      { stage: 'article-triage', topicIds: ['a'], contextId: 'articles' },
      { stage: 'grouping', topicIds: ['a'], contextId: 'stories' },
    ],
    contexts: [
      { stage: 'triage', contextId: 'articles', input: triageInput },
      {
        stage: 'grouping',
        contextId: 'stories',
        input: { kind: 'topic', model, args: ['a', [], 'edition'] },
      },
    ],
  };
  const before = structuredClone(plan);
  const result = await protectedContextPlan(plan);
  assert.equal(result.slotCount, 2);
  assert.deepEqual(
    result.requests,
    (await protectedTriageObligations(triageInput)).requests,
  );
  assert.equal(result.requests.length, 2);
  assert.deepEqual(plan, before);
  await assert.rejects(
    protectedContextPlan({ ...plan, contexts: plan.contexts.slice(0, 1) }),
    /Missing/,
  );
  await assert.rejects(
    protectedContextPlan({
      ...plan,
      contexts: [...plan.contexts, plan.contexts[0]],
    }),
    /duplicate/,
  );
  await assert.rejects(
    protectedContextPlan({
      ...plan,
      contexts: [
        {
          stage: 'grouping',
          contextId: 'stories',
          input: { kind: 'topic', model, args: ['a', [], 'foreign'] },
        },
      ],
    }),
    /edition differs/,
  );
  await assert.rejects(
    protectedContextPlan({
      ...plan,
      contexts: [
        {
          stage: 'grouping',
          contextId: 'stories',
          input: { kind: 'topic', model, args: ['foreign', [], 'edition'] },
        },
      ],
    }),
    /Invalid/,
  );
  await assert.rejects(
    protectedContextPlan({
      ...plan,
      contexts: [{ ...plan.contexts[0], contextId: 'unlisted' }],
    }),
    /Unexpected/,
  );
});

void test('context plan derives editor fallback and repair bounds and joint grouping together', async () => {
  const model = {
    id: 'offline',
    input: 1,
    output: 5,
    cacheRead: 0.1,
    cacheWrite: 1.25,
  };
  const topic = { id: 'a', name: 'Tech', description: '', guidance: '' };
  const result = await protectedContextPlan({
    editionId: 'edition',
    topicIds: ['a', 'b'],
    expected: [
      { stage: 'story', topicIds: ['a'], contextId: 'selected' },
      { stage: 'social', topicIds: ['a'], contextId: 'x' },
      { stage: 'social-triage', topicIds: ['a'], contextId: 'x' },
      { stage: 'grouping', topicIds: ['b', 'a'], contextId: 'joint' },
    ],
    contexts: [
      {
        stage: 'story',
        contextId: 'selected',
        input: {
          sonnet: model,
          haiku: model,
          args: [
            topic,
            [{ id: 'story', title: 'Launch', sources: ['Publisher'] }],
            5,
            'edition',
          ],
        },
      },
      {
        stage: 'social',
        contextId: 'x',
        input: {
          sonnet: model,
          haiku: model,
          args: [
            topic,
            [
              {
                id: 'post',
                text: 'Studio launches a game',
                author: 'Studio',
                publishedAt: '2026-11-18T12:00:00Z',
                relevance: 9,
                interestingness: 9,
                platform: 'x',
              },
            ],
            5,
            'edition',
          ],
        },
      },
      {
        stage: 'triage',
        contextId: 'x',
        input: { model, kind: 'social', args: [topic, [], 'edition'] },
      },
      {
        stage: 'grouping',
        contextId: 'joint',
        input: {
          model,
          kind: 'joint',
          args: [[topic, { ...topic, id: 'b' }], [], 'edition'],
        },
      },
    ],
  });
  assert.equal(result.slotCount, 4);
  assert.equal(result.requests.length, 8);
  assert.equal(
    result.requests.filter((r) => r.purpose === 'social-editor-v2').length,
    4,
  );
  assert.ok(
    result.requests.every((r) => r.runId === 'edition' && r.topicId === 'a'),
  );
});
