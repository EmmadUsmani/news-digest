import assert from 'node:assert/strict';
import { test } from 'node:test';

import { politicsStories } from '../src/modules/digests/application/politics-stories';
import type { Candidate } from '../src/modules/digests/domain/rank';

const start = new Date('2026-11-10T00:00:00Z');
const end = new Date('2026-11-11T00:00:00Z');
const article = (id: string): Candidate => ({
  id,
  title: 'Reported policy announcement',
  url: `https://example.com/${id}`,
  excerpt: 'Reporting on the policy announcement.',
  publishedAt: '2026-11-10T12:00:00Z',
  sources: [id],
  points: 0,
});
const pools = ['world', 'us'].map((id) => ({
  settings: {
    id,
    name: id,
    description: id,
    include_guidance: id,
    exclude_guidance: '',
    relevance_policy: { includeAny: [], excludeAny: [] },
  },
  candidates: [article(id), article('shared')],
}));
const triage = {
  async score(scope: { id: string }, candidates: Candidate[]) {
    return {
      scores: candidates.map((item) => ({
        id: item.id,
        relevance: 8,
        importance: 9,
        rationale: scope.id,
      })),
      unscoredIds: [],
    };
  },
};
void test('politics production preparation shares reports, routes complete events exclusively and reuses scores', async () => {
  let calls = 0;
  const result = await politicsStories(
    pools,
    {
      async score(...args) {
        calls++;
        return triage.score(...args);
      },
    },
    {
      async assignTopics(scopes, candidates) {
        assert.equal(new Set(candidates.map((c) => c.id)).size, 3);
        return [
          { topicId: scopes[0].id, ids: ['us', 'shared'] },
          { topicId: scopes[1].id, ids: ['world'] },
        ];
      },
    },
    start,
    end,
    'edition',
  );
  assert.ok(result);
  assert.equal(calls, 2);
  assert.equal(result.ranked.get('world')!.length, 1);
  assert.equal(result.ranked.get('us')![0].id, 'world');
  const world = result.ranked.get('world')![0];
  assert.equal(world.coverage.length, 2);
  assert.equal(result.candidates.length, 3);
});
void test('ownership refusal and incomplete paired triage abort the pair', async () => {
  assert.equal(
    await politicsStories(
      pools,
      triage,
      {
        async assignTopics() {
          return null;
        },
      },
      start,
      end,
      'edition',
    ),
    null,
  );
  assert.equal(
    await politicsStories(
      pools,
      {
        async score() {
          return { scores: [], unscoredIds: ['shared'] };
        },
      },
      {
        async assignTopics() {
          throw new Error('must not assign');
        },
      },
      start,
      end,
      'edition',
    ),
    null,
  );
});
