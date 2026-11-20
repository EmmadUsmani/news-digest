import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedGroupingObligations } from '../../../scripts/lib/protected-grouping-obligations';
import {
  protectedWorkManifest,
  type ProtectedWorkSlot,
} from '../../../scripts/lib/protected-work-manifest';

void test('declared protected inventory requires every context, including zero-call slots', async () => {
  const slot: ProtectedWorkSlot = {
    stage: 'grouping',
    topicIds: ['a', 'b'],
    contextId: 'joint',
  };
  const empty: ProtectedWorkSlot = {
    stage: 'social',
    topicIds: ['a'],
    contextId: 'bluesky',
  };
  const topic = (id: string) => ({
    id,
    name: id,
    description: '',
    guidance: '',
  });
  const bounds = await protectedGroupingObligations({
    kind: 'joint',
    model: {
      id: 'offline',
      input: 1,
      output: 5,
      cacheRead: 0.1,
      cacheWrite: 1.25,
    },
    args: [[topic('a'), topic('b')], [], 'edition'],
  });
  const plan = {
    editionId: 'edition',
    topicIds: ['a', 'b'],
    expected: [slot, empty],
    supplied: [
      { slot, requests: bounds.requests },
      { slot: empty, requests: [] },
    ],
  };
  assert.equal(protectedWorkManifest(plan).slotCount, 2);
  assert.throws(
    () =>
      protectedWorkManifest({ ...plan, supplied: plan.supplied.slice(0, 1) }),
    /Missing/,
  );
  assert.throws(
    () =>
      protectedWorkManifest({
        ...plan,
        supplied: [...plan.supplied, plan.supplied[0]],
      }),
    /duplicate/,
  );
  assert.throws(
    () =>
      protectedWorkManifest({
        ...plan,
        expected: [slot, { ...slot, topicIds: ['b', 'a'] }],
      }),
    /Duplicate/,
  );
  assert.throws(
    () =>
      protectedWorkManifest({
        ...plan,
        supplied: [{ slot: { ...slot, contextId: 'other' }, requests: [] }],
      }),
    /Unexpected/,
  );
  assert.throws(
    () =>
      protectedWorkManifest({
        ...plan,
        expected: [{ ...empty, topicIds: ['foreign'] }],
      }),
    /Invalid/,
  );
});

void test('protected requests bind to edition and slot topics and return isolated copies', () => {
  const slot: ProtectedWorkSlot = {
    stage: 'story',
    topicIds: ['a'],
    contextId: 'selected',
  };
  const request = {
    runId: 'edition',
    topicId: 'a',
    purpose: 'shortlist-editor-v14-brief',
    instructions: '',
    prompt: 'saved',
    maxOutputTokens: 10,
    model: {
      id: 'offline',
      input: 1,
      output: 5,
      cacheRead: 0.1,
      cacheWrite: 1.25,
    },
  };
  const plan = {
    editionId: 'edition',
    topicIds: ['a'],
    expected: [slot],
    supplied: [{ slot, requests: [request] }],
  };
  const result = protectedWorkManifest(plan);
  result.requests[0].prompt = 'changed';
  assert.equal(request.prompt, 'saved');
  for (const changed of [
    { ...request, runId: 'foreign' },
    { ...request, topicId: 'foreign' },
    { ...request, topicId: undefined },
  ])
    assert.throws(
      () =>
        protectedWorkManifest({
          ...plan,
          supplied: [{ slot, requests: [changed] }],
        }),
      /attribution/,
    );
  assert.throws(
    () =>
      protectedWorkManifest({
        ...plan,
        expected: [{ ...slot, topicIds: ['a', 'b'] }],
      }),
    /Invalid/,
  );
});

void test('protected inventory rejects stage substitution and wrong grouping routes', () => {
  const routes: {
    stage: ProtectedWorkSlot['stage'];
    topics: string[];
    purposes: string[];
  }[] = [
    {
      stage: 'article-triage',
      topics: ['a'],
      purposes: ['candidate-triage-v1'],
    },
    { stage: 'social-triage', topics: ['a'], purposes: ['social-triage-v1'] },
    { stage: 'grouping', topics: ['a'], purposes: ['story-grouping-v3'] },
    {
      stage: 'grouping',
      topics: ['a', 'b'],
      purposes: ['joint-story-grouping-v2'],
    },
    {
      stage: 'story',
      topics: ['a'],
      purposes: [
        'shortlist-editor-v16-nba',
        'shortlist-editor-v16-gaming',
        'shortlist-editor-v16-brief',
        'shortlist-editor-v14-nba',
        'shortlist-editor-v15-gaming',
        'shortlist-editor-v14-brief',
      ],
    },
    {
      stage: 'social',
      topics: ['a'],
      purposes: ['social-editor-v2', 'bluesky-social-editor-v2'],
    },
  ];
  const allPurposes = routes.flatMap((route) => route.purposes);
  for (const route of routes) {
    const slot: ProtectedWorkSlot = {
      stage: route.stage,
      topicIds: route.topics,
      contextId: 'saved',
    };
    for (const purpose of [
      ...allPurposes,
      '',
      'developing-story-match-v1',
      'shortlist-editor-v999',
    ]) {
      const plan = {
        editionId: 'edition',
        topicIds: ['a', 'b'],
        expected: [slot],
        supplied: [
          {
            slot,
            requests: [
              {
                runId: 'edition',
                topicId: route.topics.length === 1 ? 'a' : undefined,
                purpose,
                instructions: '',
                prompt: 'saved',
                maxOutputTokens: 10,
                model: {
                  id: 'offline',
                  input: 1,
                  output: 5,
                  cacheRead: 0.1,
                  cacheWrite: 1.25,
                },
              },
            ],
          },
        ],
      };
      if (route.purposes.includes(purpose))
        assert.equal(protectedWorkManifest(plan).requests.length, 1);
      else assert.throws(() => protectedWorkManifest(plan), /purpose differs/);
    }
  }
});
