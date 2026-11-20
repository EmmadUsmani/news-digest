import assert from 'node:assert/strict';
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
