import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { captureDevelopingExecution } from '../../../scripts/lib/capture-developing-execution';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { developingCapturedRequests } from '../src/modules/curation/application/developing-captured-requests';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import { runCapturedDevelopingLlmPlan } from '../src/modules/curation/application/run-reserved-llm-plan';
import type { LlmPort } from '../src/modules/curation/domain/llm.port';
import { enrichDevelopingEdition } from '../src/modules/digests/application/enrich-developing-edition';

function execute(port: LlmPort) {
  const model = llmConfig({}).haiku;
  const llm = new BudgetedLlm(port, {
    reserve: async () => 'offline',
    settle: async () => {},
    fail: async () => {},
    cached: async () => undefined,
    cache: async () => {},
  });
  return enrichDevelopingEdition([
    {
      topicId: 'tech',
      topicName: 'Tech',
      runId: 'edition',
      editorialMode: 'ai',
      publishedAt: '2026-11-20T15:00:00Z',
      selected: [
        {
          id: 'a',
          title: 'Accepted',
          summary: 'Original',
          whyItMatters: 'Impact',
        },
      ],
      evidence: [
        {
          id: 'a',
          title: 'Reporting',
          excerpt: 'New reporting',
          sources: ['Source'],
        },
      ],
      history: [
        {
          editionId: '00000000-0000-4000-8000-000000000001',
          publishedAt: '2026-11-19T15:00:00Z',
          stories: [
            {
              id: '00000000-0000-4000-8000-000000000002',
              title: 'Earlier',
              summary: 'Earlier reporting',
            },
          ],
        },
      ],
      grouping: new EventGrouping(llm, model),
      llm: port,
      model,
    },
  ]);
}
const matching = JSON.stringify({ groups: [['current:0', 'history:0:0']] });
const rewrite = JSON.stringify([
  {
    id: 'a',
    title: 'Updated',
    summary: 'New reporting',
    whyItMatters: 'Impact',
  },
]);

void test('captures actual edition matching and fixed-selection rewrite requests offline', async () => {
  const result = await captureDevelopingExecution({
    editionId: 'edition',
    topicIds: ['tech'],
    responses: [matching, rewrite],
    execute,
  });
  assert.equal(result.value.status, 'completed');
  assert.equal(result.value.topics[0].stories[0].title, 'Updated');
  assert.equal(result.responsesConsumed, 2);
  const requests = developingCapturedRequests(result.captures);
  assert.deepEqual(
    requests.map((r) => r.purpose),
    ['story-grouping-v3', 'developing-rewrite'],
  );
  const candidates = JSON.parse(requests[0].prompt).candidates;
  assert.equal(candidates[0].title, 'Reporting');
  assert.equal(candidates[0].excerpt, 'New reporting');
  assert.ok(!requests[0].prompt.includes('Accepted'));
  assert.ok(requests[1].prompt.includes('Accepted'));
  assert.ok(requests[1].prompt.includes('New reporting'));
  assert.ok(requests[1].prompt.includes('Earlier'));
  const replay = await captureDevelopingExecution({
    editionId: 'edition',
    topicIds: ['tech'],
    responses: [matching, rewrite],
    execute,
  });
  assert.deepEqual(replay.captures, result.captures);
});

void test('no-link and refused executions never fabricate rewrite coverage', async () => {
  for (const responses of [[JSON.stringify({ groups: [] })], [], [matching]]) {
    const result = await captureDevelopingExecution({
      editionId: 'edition',
      topicIds: ['tech'],
      responses,
      execute,
    });
    assert.equal(result.captures.matching.length, 1);
    if (responses[0] !== matching) {
      assert.equal(result.captures.rewrites.length, 0);
      assert.throws(
        () => developingCapturedRequests(result.captures),
        /Missing edition topic capture/,
      );
    } else {
      assert.equal(result.value.status, 'unchanged');
      assert.equal(result.value.topics[0].stories[0].title, 'Accepted');
      // Capture is request construction evidence, not successful execution.
      assert.equal(result.captures.rewrites.length, 1);
    }
  }
});

void test('saved Peltola, GTA and Zelda captures bind complete admitted execution and atomic refusal', async () => {
  type Topic = Parameters<typeof enrichDevelopingEdition>[0][number];
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
      editionId: string;
      topicId: string;
      topicName: string;
      windowEnd: string;
      reviewedStoryId: string;
      history: Topic['history'];
      selected?: Topic['selected'];
      originalEditorialEvidence?: { evidence: Topic['evidence'] };
      expectedPredecessors: { editionId: string; storyId: string }[];
      reviews: {
        storyId: string;
        expectedPredecessors: { editionId: string; storyId: string }[];
      }[];
    }[];
  };
  const cases = fixture.cases.filter(
    (item) => item.selected && item.originalEditorialEvidence,
  );
  assert.equal(cases.length, 2);
  const editionTopics: Omit<Topic, 'grouping' | 'llm' | 'model'>[] = [];
  const editionMatches: string[] = [];
  for (const item of cases) {
    const selected = item.selected!;
    const evidence = item.originalEditorialEvidence!.evidence;
    const before = structuredClone(item);
    const currentIndex = selected.findIndex(
      (story) => story.id === item.reviewedStoryId,
    );
    assert.ok(currentIndex >= 0);
    const groups = item.reviews
      .filter((label) => label.expectedPredecessors.length > 0)
      .map((label) => {
        const index = selected.findIndex((story) => story.id === label.storyId);
        assert.ok(index >= 0);
        return [
          `current:${index}`,
          ...label.expectedPredecessors.map((previous) => {
            const editionIndex = item.history.findIndex(
              (edition) => edition.editionId === previous.editionId,
            );
            assert.ok(editionIndex >= 0);
            const storyIndex = item.history[editionIndex].stories.findIndex(
              (story) => story.id === previous.storyId,
            );
            assert.ok(storyIndex >= 0);
            return `history:${editionIndex}:${storyIndex}`;
          }),
        ];
      });
    assert.equal(groups.length, item.topicName === 'Gaming' ? 2 : 1);
    const matchingResponse = JSON.stringify({ groups });
    editionTopics.push({
      ...item,
      selected,
      evidence,
      publishedAt: item.windowEnd,
      runId: item.editionId,
      editorialMode: 'ai',
    });
    editionMatches.push(matchingResponse);
    const run = (rewriteResponse = 'null') =>
      captureDevelopingExecution({
        editionId: item.editionId,
        topicIds: [item.topicId],
        // Manual memberships and scripted refusal test transport only, never semantics.
        responses: [matchingResponse, rewriteResponse],
        async execute(port) {
          const models = llmConfig({});
          const llm = new BudgetedLlm(port, {
            reserve: async () => 'offline',
            settle: async () => {},
            fail: async () => {},
            cached: async () => undefined,
            cache: async () => {},
          });
          return enrichDevelopingEdition([
            {
              ...item,
              selected,
              evidence,
              publishedAt: item.windowEnd,
              runId: item.editionId,
              editorialMode: 'ai',
              grouping: new EventGrouping(llm, models.haiku),
              llm: port,
              model: models.sonnet,
            },
          ]);
        },
      });
    const result = await run();
    assert.equal(result.responsesConsumed, 2);
    assert.equal(result.value.status, 'unchanged');
    assert.equal(result.value.topics[0].stories, selected);
    const requests = developingCapturedRequests(result.captures);
    assert.equal(requests.length, 2);
    assert.ok(
      requests.every(
        (request) =>
          request.runId === item.editionId && request.topicId === item.topicId,
      ),
    );
    const candidates = JSON.parse(requests[0].prompt).candidates;
    for (const [index, story] of selected.entries()) {
      const original = evidence.find((source) => source.id === story.id)!;
      assert.equal(candidates[index].title, original.title.slice(0, 500));
      assert.equal(
        candidates[index].excerpt,
        (original.excerpt ?? '').slice(0, 600),
      );
    }
    const original = evidence.find(
      (source) => source.id === item.reviewedStoryId,
    )!;
    assert.ok(
      requests[1].prompt.includes(
        JSON.stringify(original.excerpt).slice(1, -1),
      ),
    );
    const rewriteStories = JSON.parse(requests[1].prompt).stories;
    assert.deepEqual(
      rewriteStories.map(
        (story: { selected: { id: string } }) => story.selected.id,
      ),
      item.reviews
        .filter((label) => label.expectedPredecessors.length > 0)
        .map((label) => label.storyId),
    );
    assert.equal(requests[0].model.id, llmConfig({}).haiku.id);
    assert.equal(requests[1].model.id, llmConfig({}).sonnet.id);
    assert.deepEqual((await run()).captures, result.captures);
    assert.deepEqual(item, before);
    if (item.topicName === 'U.S. news & politics') {
      // Agent-authored reference prose, reviewed against the saved current
      // evidence. This exercises a real update; it is not a model response.
      const reference = {
        id: item.reviewedStoryId,
        title: 'Mary Peltola wins Alaska Senate race against Dan Sullivan',
        summary:
          'Mary Peltola has defeated Republican incumbent Dan Sullivan in Alaska’s Senate race. The final unresolved Senate contest gives Democrats a 56-44 majority after flipping nine Republican-held seats.',
        whyItMatters:
          'The result settles the final Senate race and the chamber’s 56-44 balance.',
      };
      const updated = await run(JSON.stringify([reference]));
      assert.equal(updated.value.status, 'completed');
      const stories = updated.value.topics[0].stories;
      assert.deepEqual(
        stories.map((story) => story.id),
        selected.map((story) => story.id),
      );
      for (const [index, story] of stories.entries()) {
        if (story.id === reference.id) {
          assert.equal(story.summary, reference.summary);
          assert.equal(story.title, reference.title);
          assert.equal(story.whyItMatters, reference.whyItMatters);
        } else assert.deepEqual(story, selected[index]);
      }
      assert.deepEqual(item, before);
    }
  }
  // Both saved cases belong to the same real edition. Capture the combined
  // coordinator path rather than adding independent per-topic estimates.
  assert.equal(new Set(cases.map((item) => item.editionId)).size, 1);
  const combined = await captureDevelopingExecution({
    editionId: cases[0].editionId,
    topicIds: cases.map((item) => item.topicId),
    responses: [...editionMatches, 'null'],
    async execute(port) {
      const models = llmConfig({});
      const budgeted = new BudgetedLlm(port, {
        reserve: async () => 'offline',
        settle: async () => {},
        fail: async () => {},
        cached: async () => undefined,
        cache: async () => {},
      });
      return enrichDevelopingEdition(
        editionTopics.map((topic) => ({
          ...topic,
          grouping: new EventGrouping(budgeted, models.haiku),
          llm: port,
          model: models.sonnet,
        })),
      );
    },
  });
  assert.equal(combined.responsesConsumed, 3);
  assert.equal(combined.value.status, 'unchanged');
  assert.equal(combined.value.reason, 'rewrite-refused');
  for (const [index, topic] of editionTopics.entries()) {
    assert.equal(combined.value.topics[index].stories, topic.selected);
    assert.equal(combined.captures.matching[index].topicId, topic.topicId);
  }
  assert.equal(combined.captures.matching.length, 2);
  assert.equal(combined.captures.rewrites.length, 1);
  assert.equal(combined.captures.rewrites[0].topicId, editionTopics[0].topicId);
  // A refusal stops the second rewrite. This partial capture must never be
  // promoted to complete edition admission by summing its observed requests.
  assert.throws(
    () => developingCapturedRequests(combined.captures),
    /Missing edition topic capture/,
  );
  // Scripted unchanged prose is a transport control, including the repeat-only
  // Zelda case. It is not an editorially accepted developing-story rewrite.
  const responses = [
    ...editionMatches,
    ...cases.map((item) => {
      return JSON.stringify(
        item.reviews
          .filter((label) => label.expectedPredecessors.length > 0)
          .map((label) => {
            const story = item.selected!.find((s) => s.id === label.storyId)!;
            return {
              id: story.id,
              title: story.title,
              summary: story.summary,
              whyItMatters: story.whyItMatters,
            };
          }),
      );
    }),
  ];
  const executeBudgeted = (llm: BudgetedLlm) => {
    const models = llmConfig({});
    return enrichDevelopingEdition(
      editionTopics.map((topic) => ({
        ...topic,
        grouping: new EventGrouping(llm, models.haiku),
        llm: {
          async complete(request, execution) {
            const outcome = await llm.jsonOutcome(request, (value) => value, {
              repair: false,
              execution,
            });
            if (outcome.status !== 'complete') throw new Error(outcome.status);
            return {
              text: JSON.stringify(outcome.value),
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            };
          },
        },
        model: models.sonnet,
      })),
    );
  };
  const complete = await captureDevelopingExecution({
    editionId: cases[0].editionId,
    topicIds: cases.map((item) => item.topicId),
    responses,
    execute: (port) =>
      executeBudgeted(
        new BudgetedLlm(port, {
          reserve: async () => 'offline',
          settle: async () => {},
          fail: async () => {},
          cached: async () => undefined,
          cache: async () => {},
        }),
      ),
  });
  assert.equal(complete.value.status, 'completed');
  assert.equal(complete.responsesConsumed, 4);
  const completeRequests = developingCapturedRequests(complete.captures);
  assert.deepEqual(
    completeRequests.map((request) => request.purpose),
    [
      'story-grouping-v3',
      'story-grouping-v3',
      'developing-rewrite',
      'developing-rewrite',
    ],
  );
  const settled: string[] = [];
  const released: string[] = [];
  let batches = 0;
  let dispatched = 0;
  const admitted = await runCapturedDevelopingLlmPlan({
    captures: complete.captures,
    // Empty only in this offline feature-scope control. Morning obligations
    // still require derivation before any production admission.
    protectedRequests: [],
    ledger: {
      reserveBatch: async (entries) => {
        batches++;
        assert.deepEqual(
          entries.map((entry) => entry.request),
          completeRequests,
        );
        assert.ok(entries.every((entry) => entry.estimate > 0));
        return {
          status: 'admitted',
          ids: entries.map((_, index) => String(index)),
        };
      },
      reserve: async () => {
        throw new Error('Unexpected second reservation');
      },
      settle: async (id) => {
        settled.push(id);
      },
      fail: async (id) => {
        released.push(id);
      },
      cached: async () => undefined,
      cache: async () => {},
    },
    provider: {
      complete: async (request) => {
        assert.deepEqual(request, completeRequests[dispatched]);
        return {
          text: responses[dispatched++],
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        };
      },
    },
    execute: executeBudgeted,
  });
  assert.equal(admitted.status, 'completed');
  if (admitted.status === 'completed')
    assert.deepEqual(admitted.value, complete.value);
  assert.equal(batches, 1);
  assert.equal(dispatched, 4);
  assert.deepEqual(settled, ['0', '1', '2', '3']);
  assert.deepEqual(released, []);
});
