import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { captureDevelopingExecution } from '../../../scripts/lib/capture-developing-execution';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { developingCapturedRequests } from '../src/modules/curation/application/developing-captured-requests';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
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

void test('saved Peltola and Zelda execution captures retain original evidence and atomic refusal', async () => {
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
    const references = item.expectedPredecessors.map((previous) => {
      const editionIndex = item.history.findIndex(
        (edition) => edition.editionId === previous.editionId,
      );
      assert.ok(editionIndex >= 0);
      const storyIndex = item.history[editionIndex].stories.findIndex(
        (story) => story.id === previous.storyId,
      );
      assert.ok(storyIndex >= 0);
      return `history:${editionIndex}:${storyIndex}`;
    });
    assert.ok(references.length > 0);
    editionTopics.push({
      ...item,
      selected,
      evidence,
      publishedAt: item.windowEnd,
      runId: item.editionId,
      editorialMode: 'ai',
    });
    editionMatches.push(
      JSON.stringify({
        groups: [[`current:${currentIndex}`, ...references]],
      }),
    );
    const run = () =>
      captureDevelopingExecution({
        editionId: item.editionId,
        topicIds: [item.topicId],
        // Manual memberships and scripted refusal test transport only, never semantics.
        responses: [
          JSON.stringify({
            groups: [[`current:${currentIndex}`, ...references]],
          }),
          'null',
        ],
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
    assert.equal(requests[0].model.id, llmConfig({}).haiku.id);
    assert.equal(requests[1].model.id, llmConfig({}).sonnet.id);
    assert.deepEqual((await run()).captures, result.captures);
    assert.deepEqual(item, before);
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
});
