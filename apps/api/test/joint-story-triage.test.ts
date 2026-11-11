import assert from 'node:assert/strict';
import { test } from 'node:test';

import { jointStoryTriage } from '../src/modules/digests/application/joint-story-triage';
import type { Candidate } from '../src/modules/digests/domain/rank';

const scopes = ['world', 'us'].map((id) => ({
  id,
  name: id,
  description: id,
  guidance: '',
}));
const candidates: Candidate[] = [
  {
    id: 'a',
    title: 'Report',
    excerpt: 'Supplied facts',
    url: 'https://example.com/a',
    publishedAt: '2026-11-10T12:00:00Z',
    sources: ['Publisher'],
    points: 0,
  },
];
const score = {
  id: 'a',
  relevance: 8,
  importance: 7,
  event: 'Event',
  rationale: 'Facts',
};

void test('paired triage scores the complete shared pool against both scopes independently', async () => {
  const calls: string[] = [];
  const result = await jointStoryTriage(
    {
      async score(topic, items, runId) {
        calls.push(topic.id);
        assert.deepEqual(items, candidates);
        assert.equal(runId, 'edition');
        return {
          scores: [{ ...score, relevance: topic.id === 'world' ? 2 : 9 }],
          unscoredIds: [],
        };
      },
    },
    scopes,
    candidates,
    'edition',
  );
  assert.deepEqual(calls, ['world', 'us']);
  assert.equal(result?.get('world')?.scores[0].relevance, 2);
  assert.equal(result?.get('us')?.scores[0].relevance, 9);
});

void test('incomplete, duplicate, foreign, invalid and failed triage refuse before later spending', async () => {
  for (const result of [
    { scores: [], unscoredIds: ['a'] },
    { scores: [score, score], unscoredIds: [] },
    { scores: [{ ...score, id: 'foreign' }], unscoredIds: [] },
    { scores: [{ ...score, importance: NaN }], unscoredIds: [] },
    { scores: [score], unscoredIds: [], failures: ['unavailable' as const] },
  ]) {
    let calls = 0;
    assert.equal(
      await jointStoryTriage(
        {
          async score() {
            calls++;
            return result;
          },
        },
        scopes,
        candidates,
        'edition',
      ),
      null,
    );
    assert.equal(calls, 1);
  }
  let calls = 0;
  assert.equal(
    await jointStoryTriage(
      {
        async score() {
          if (++calls === 2) throw new Error('unavailable');
          return { scores: [score], unscoredIds: [] };
        },
      },
      scopes,
      candidates,
      'edition',
    ),
    null,
  );
  assert.equal(calls, 2);
});

void test('invalid admission never calls triage; empty pools succeed without calls', async () => {
  const triage = {
    async score(): Promise<never> {
      throw new Error('must not call');
    },
  };
  for (const items of [
    [...candidates, ...candidates],
    Array.from({ length: 201 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    })),
  ]) {
    assert.equal(
      await jointStoryTriage(triage, scopes, items, 'edition'),
      null,
    );
  }
  assert.equal(
    await jointStoryTriage(
      triage,
      [scopes[0], scopes[0]],
      candidates,
      'edition',
    ),
    null,
  );
  assert.equal(
    (await jointStoryTriage(triage, scopes, [], 'edition'))?.size,
    2,
  );
});
