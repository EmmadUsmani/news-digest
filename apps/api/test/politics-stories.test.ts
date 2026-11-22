import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fillSharedStoryPool } from '../src/modules/digests/application/joint-story-shortlists';
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
  assert.deepEqual(result.storyOwnership, {
    inputArticles: ['shared', 'us', 'world'].map((id) => ({
      id,
      url: article(id).url,
    })),
    groups: [
      { topicId: 'world', ids: ['us', 'shared'] },
      { topicId: 'us', ids: ['world'] },
    ],
  });
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

void test('ownership evidence retains groups rejected by destination relevance before editing', async () => {
  const result = await politicsStories(
    pools,
    {
      async score(scope, candidates) {
        const result = await triage.score(scope, candidates);
        return {
          ...result,
          scores: result.scores.map((score) =>
            scope.id === 'world' && score.id === 'us'
              ? { ...score, relevance: 0, importance: 0 }
              : score,
          ),
        };
      },
    },
    {
      async assignTopics() {
        return [
          { topicId: 'world', ids: ['us'] },
          { topicId: 'us', ids: ['world', 'shared'] },
        ];
      },
    },
    start,
    end,
    'offline',
  );
  assert.ok(result);
  assert.deepEqual(result.ranked.get('world'), []);
  assert.deepEqual(result.storyOwnership?.groups[0], {
    topicId: 'world',
    ids: ['us'],
  });
  assert.ok(
    result.storyOwnership?.inputArticles.some(
      (item) => item.id === 'us' && item.url === article('us').url,
    ),
  );
});

void test('prepared shared pool backfills overlap without displacing baseline reports or raising the forty-report cap', () => {
  const scopes = pools.map((pool) => ({
    id: pool.settings.id,
    name: pool.settings.name,
    description: pool.settings.description,
    guidance: '',
  }));
  for (const overlap of [0, 5, 20]) {
    const inputs = scopes.map((scope, scopeIndex) => ({
      scope,
      candidates: Array.from({ length: 40 }, (_, index) =>
        article(index < overlap ? `shared-${index}` : `${scopeIndex}-${index}`),
      ),
    }));
    const before = new Set(
      inputs.flatMap((p) => p.candidates.slice(0, 20).map((c) => c.id)),
    );
    const prepared = fillSharedStoryPool(inputs);
    const after = new Set(
      prepared.flatMap((p) => p.candidates.map((c) => c.id)),
    );
    assert.equal(after.size, 40);
    assert.ok([...before].every((id) => after.has(id)));
    assert.equal(
      inputs[0].candidates.length,
      40,
      'input snapshots stay unchanged',
    );
    assert.deepEqual(
      fillSharedStoryPool(inputs),
      prepared,
      'deterministic admission',
    );
  }
  const sparse = scopes.map((scope) => ({
    scope,
    candidates: [article('shared')],
  }));
  assert.equal(
    new Set(
      fillSharedStoryPool(sparse).flatMap((p) => p.candidates.map((c) => c.id)),
    ).size,
    1,
  );
});
