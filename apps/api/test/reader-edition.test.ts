import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';

import { type PreviewRepository } from '../src/modules/digests/domain/preview.repository';
import {
  readerEdition,
  ReaderEditionController,
} from '../src/modules/digests/reader-edition.controller';

const id = '00000000-0000-4000-8000-000000000001';
const snapshot: DigestPreview = {
  id,
  createdAt: '2026-11-04',
  windowStart: '2026-11-03',
  windowEnd: '2026-11-04',
  method: 'editorial-v1',
  topics: [
    {
      id,
      name: 'Tech',
      candidateCount: 99,
      editorial: {
        mode: 'ai',
        model: 'private-model',
        reason: 'private-reason',
        brief: ['News today'],
        triage: [],
        unscoredIds: [],
      },
      stories: [
        {
          id,
          title: 'Launch',
          url: 'https://example.com/story',
          excerpt: 'private-excerpt',
          summary: 'A launch.',
          whyItMatters: 'private-note',
          score: 95,
          reasons: ['private-rank'],
          sources: ['Example'],
          publishedAt: '2026-11-04',
        },
      ],
      posts: [
        {
          platform: 'x',
          externalId: '123',
          url: 'https://x.com/a/status/123',
          author: 'a',
          authorUrl: 'https://x.com/a',
          publishedAt: '2026-11-04T12:00:00Z',
          text: 'A post',
          metrics: { likes: 100 },
          reasons: ['private-post'],
          xSearchRanking: { bonus: 2, reason: 'private-search' },
          whyItMatters: 'private-note',
        },
      ],
    },
  ],
};

void test('reader projection keeps content and excludes nested operational fields without changing saved editions', () => {
  const before = JSON.stringify(snapshot);
  const result = readerEdition(snapshot);
  assert.deepEqual(Object.keys(result).sort(), [
    'createdAt',
    'id',
    'topics',
    'windowEnd',
    'windowStart',
  ]);
  assert.deepEqual(Object.keys(result.topics[0]).sort(), [
    'brief',
    'id',
    'name',
    'posts',
    'stories',
  ]);
  assert.deepEqual(result.topics[0].brief, ['News today']);
  assert.equal(result.topics[0].stories[0].summary, 'A launch.');
  assert.equal(result.topics[0].posts[0].metrics.likes, 100);
  assert.doesNotMatch(
    JSON.stringify(result),
    /private-|candidateCount|score|reasons|triage|method/,
  );
  assert.equal(JSON.stringify(snapshot), before);
  const historical = structuredClone(snapshot);
  delete historical.topics[0].editorial;
  delete historical.topics[0].posts;
  assert.deepEqual(readerEdition(historical).topics[0].brief, []);
  assert.deepEqual(readerEdition(historical).topics[0].posts, []);
  historical.topics[0].editorial = {
    ...snapshot.topics[0].editorial!,
    mode: 'non-ai',
  };
  assert.deepEqual(readerEdition(historical).topics[0].brief, []);
});

void test('reader endpoints handle latest, immutable ID lookup and missing editions', async () => {
  const repository = {
    latest: async () => snapshot,
    find: async (requested: string) => (requested === id ? snapshot : null),
  } as PreviewRepository;
  const controller = new ReaderEditionController(repository);
  assert.deepEqual(await controller.latest(), readerEdition(snapshot));
  assert.deepEqual(await controller.find(id), readerEdition(snapshot));
  await assert.rejects(controller.find('missing'), /Edition not found/);
  repository.latest = async () => null;
  assert.equal(await controller.latest(), null);
});
