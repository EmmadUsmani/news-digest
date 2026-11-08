import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developmentEditorialServices } from '../src/modules/curation/public/development-editorial';

const topic = { id: 'topic', name: 'Tech', description: '', guidance: '' };
const candidates = [
  { id: 'article', title: 'Fixture', excerpt: null, sources: [] },
];
const score = {
  id: '0',
  relevance: 9,
  importance: 8,
  event: 'Fixture',
  rationale: 'Fixture',
};
const complete = (text: string) => ({
  status: 'complete' as const,
  mustReport: false,
  value: { text, usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 } },
});

void test('development composition shares local triage only within one edition and isolates article/social scores', async () => {
  const calls: { role: string; id: string }[] = [];
  const runtime = {
    complete: async (request: { role: string }, id: string) => {
      calls.push({ role: request.role, id });
      return complete(JSON.stringify({ items: [score] }));
    },
  };
  const services = developmentEditorialServices(runtime, 'edition');
  assert.equal(services.grouping, null);
  assert.deepEqual(services.validationDiagnostics(), []);
  const first = await services.triage.score(topic, candidates, 'edition');
  assert.equal(first.scores[0]?.id, 'article');
  assert.deepEqual(
    await services.triage.score(topic, candidates, 'edition'),
    first,
  );
  assert.equal(calls.length, 1);
  await services.socialTriage.score(topic, candidates, 'edition');
  assert.equal(calls.length, 2);
  const next = developmentEditorialServices(runtime, 'next', true);
  assert.ok(next.grouping);
  await next.triage.score(topic, candidates, 'next');
  assert.deepEqual(calls, [
    { role: 'haiku', id: 'edition:editor:1' },
    { role: 'haiku', id: 'edition:editor:2' },
    { role: 'haiku', id: 'next:editor:1' },
  ]);
});

void test('article and social editors share the same development stop latch with triage', async () => {
  let calls = 0;
  const services = developmentEditorialServices(
    {
      complete: async () => {
        calls++;
        return { status: 'budget-refused', mustReport: true };
      },
    },
    'stopped',
  );
  await assert.rejects(
    services.triage.score(topic, candidates, 'stopped'),
    /report required/,
  );
  await assert.rejects(
    services.editor.edit(topic, candidates, 1, 'stopped'),
    /stopped/,
  );
  await assert.rejects(
    services.socialEditor.edit(
      topic,
      [
        {
          id: 'post',
          platform: 'x',
          text: 'Fixture',
          author: 'fixture',
          publishedAt: '2026-11-01T00:00:00Z',
          relevance: 9,
          interestingness: 8,
        },
      ],
      1,
      'stopped',
    ),
    /stopped/,
  );
  assert.equal(calls, 1);
});

void test('composed editors use fixed Sonnet roles and unique attempts for both content types', async () => {
  const calls: { role: string; id: string }[] = [];
  const services = developmentEditorialServices(
    {
      complete: async (request, id) => {
        calls.push({ role: request.role, id });
        return complete(
          calls.length === 1 ? '{"brief":[],"stories":[]}' : '{"posts":[]}',
        );
      },
    },
    'edited',
  );
  assert.ok(await services.editor.edit(topic, candidates, 1, 'edited'));
  assert.ok(
    await services.socialEditor.edit(
      topic,
      [
        {
          id: 'post',
          platform: 'x',
          text: 'Fixture',
          author: 'fixture',
          publishedAt: '2026-11-01T00:00:00Z',
          relevance: 9,
          interestingness: 8,
        },
      ],
      1,
      'edited',
    ),
  );
  assert.deepEqual(calls, [
    { role: 'sonnet', id: 'edited:editor:1' },
    { role: 'sonnet', id: 'edited:editor:2' },
  ]);
});
