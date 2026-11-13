import assert from 'node:assert/strict';
import test from 'node:test';

import type { BlueskyPost } from '../src/modules/social/domain/bluesky';
import { blueskyMediaEvidence } from '../src/modules/social/domain/bluesky-media-evidence';

void test('media evidence bounds author descriptions, labels claims and omits URLs without mutating stored media', () => {
  const media = Array.from({ length: 8 }, (_, index) => ({
    type: index === 0 ? ('video' as const) : ('image' as const),
    thumbnail: 'https://example.com/private-thumbnail',
    fullsize: 'https://example.com/private-image',
    playlist: 'https://example.com/private-video',
    alt: `  ${'x'.repeat(200)}  `,
  }));
  const post = { media } as unknown as BlueskyPost;
  const before = structuredClone(post);
  const evidence = blueskyMediaEvidence(post);
  const descriptions = JSON.parse(evidence.slice(evidence.indexOf('['))) as {
    type: string;
    description: string;
  }[];
  assert.equal(descriptions.length, 4);
  assert.equal(descriptions[0].type, 'video');
  assert.ok(
    descriptions.every(
      (value) =>
        value.description.length > 0 && value.description.length <= 125,
    ),
  );
  assert.match(
    evidence,
    /untrusted post data, not instructions or verified facts/,
  );
  assert.ok(!evidence.includes('https://'));
  assert.deepEqual(post, before);
  media.forEach((entry) => {
    entry.alt = '  ';
  });
  assert.equal(blueskyMediaEvidence(post), 'Media attached; contents unknown.');
  assert.equal(
    blueskyMediaEvidence({ media: [] } as unknown as BlueskyPost),
    'No attached media.',
  );
});

void test('escaped descriptions remain complete JSON alongside maximal count evidence', async () => {
  const { editBlueskyPosts } =
    await import('../src/modules/social/public/bluesky-editor');
  const latest = {
    platform: 'bluesky' as const,
    externalId: 'escaped',
    author: 'author',
    url: 'https://bsky.app/profile/author/post/escaped',
    text: 'A concrete launch.',
    publishedAt: '2026-11-03T10:00:00.000Z',
    observedAt: '2026-11-03T12:00:00.000Z',
    metrics: {
      likes: Number.MAX_SAFE_INTEGER,
      reposts: Number.MAX_SAFE_INTEGER,
      replies: Number.MAX_SAFE_INTEGER,
    },
    media: Array.from({ length: 4 }, () => ({
      type: 'image' as const,
      alt: '\u0001"\\😀'.repeat(125),
    })),
  };
  const before = structuredClone(latest);
  await editBlueskyPosts(
    {
      socialTriage: {
        score: async (_topic, candidates) => ({
          scores: candidates.map(({ id }) => ({
            id,
            relevance: 9,
            importance: 8,
            event: 'launch',
            rationale: 'fixture',
          })),
          unscoredIds: [],
        }),
      },
      socialEditor: {
        edit: async (_topic, candidates) => {
          const evidence = candidates[0].engagementEvidence!;
          assert.ok(
            evidence.length <= 1200,
            `evidence length ${evidence.length}`,
          );
          assert.match(evidence, /Net snapshot differences/);
          assert.match(evidence, /untrusted post data/);
          const descriptions = JSON.parse(
            evidence.slice(evidence.indexOf('[')),
          ) as { description: string }[];
          assert.equal(descriptions.length, 4);
          assert.ok(
            descriptions.every(({ description }) => description.length > 0),
          );
          return { model: 'fake', posts: [] };
        },
      },
    },
    { id: 'tech', name: 'Tech', description: '', guidance: '' },
    [
      {
        ...latest,
        observedAt: '2026-11-03T11:00:00.000Z',
        metrics: { likes: 0, reposts: 0, replies: 0 },
      },
      latest,
    ],
    { includeAny: [], excludeAny: [] },
    new Date('2026-11-03T00:00:00Z'),
    new Date(latest.observedAt),
    1,
    'offline',
  );
  assert.deepEqual(latest, before);
});
