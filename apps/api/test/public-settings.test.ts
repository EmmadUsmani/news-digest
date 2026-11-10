import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

import {
  readPublicSchedule,
  readPublicSourceCatalog,
  readPublicTopics,
} from '../src/public-read/settings';
import { classifyPublicRoute } from '../src/public-route-policy';

const secret = 'fixture-private-owner-token-database-error';
const schedule = {
  cadence: '0 15 * * *',
  timezone: 'UTC',
  coverageWindow: '24h',
  storyBudget: 5,
  postBudget: 5,
};
const topic = {
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Tech',
  description: 'Technology',
  includeGuidance: 'Launches',
  excludeGuidance: 'Spam',
  enabled: true,
  position: 0,
  storyBudget: 5,
  postBudget: 5,
  relevancePolicy: { includeAny: [], excludeAny: [] },
  sources: ['hn'],
  queries: ['technology'],
  accounts: ['example'],
  redditCommunities: [],
  blueskyQuery: 'technology',
  xDiscovery: { minimumLikes: 10, exclusions: ['-spam'] },
};

void test('prepared public settings preserve configured fields without owner or future columns', async () => {
  assert.deepEqual(
    await readPublicSchedule(async () => ({
      ...schedule,
      id: secret,
      name: secret,
      token: secret,
    })),
    schedule,
  );
  const rows = await readPublicTopics(async () => [
    { ...topic, profileId: secret, ownerEmail: secret, futureColumn: secret },
  ]);
  assert.deepEqual(rows, [topic]);
  assert.equal(JSON.stringify(rows).includes(secret), false);
  // Legacy profiles stay restricted; topics use the audited system-only transport.
  for (const method of ['GET', 'HEAD']) {
    assert.equal(classifyPublicRoute(method, '/api/admin/profile'), 'admin');
    assert.equal(
      classifyPublicRoute(method, '/api/admin/topics'),
      'public-read',
    );
  }
});

void test('prepared public settings fail closed with exact generic errors', async () => {
  for (const [reader, message, valid] of [
    [readPublicSchedule, 'Schedule settings unavailable', schedule],
    [readPublicTopics, 'Topic settings unavailable', [topic]],
  ] as const) {
    for (const read of [
      async () => {
        throw new Error(secret);
      },
      async () => null,
      async () => ({ private: secret }),
      async () =>
        reader === readPublicTopics
          ? [
              {
                ...topic,
                relevancePolicy: { ...topic.relevancePolicy, token: secret },
              },
            ]
          : { ...schedule, storyBudget: secret },
    ]) {
      await assert.rejects(reader(read), (error: unknown) => {
        assert.ok(error instanceof ServiceUnavailableException);
        assert.deepEqual(error.getResponse(), {
          message,
          error: 'Service Unavailable',
          statusCode: 503,
        });
        assert.equal(
          JSON.stringify(error.getResponse()).includes(secret),
          false,
        );
        return true;
      });
    }
    assert.ok(await reader(async () => valid));
  }
});

void test('prepared public source catalog exposes origins without feed credentials or future fields', async () => {
  assert.deepEqual(
    await readPublicSourceCatalog(async () => [
      {
        id: 'feed',
        name: 'Publisher',
        url: `https://feeds.publisher.org/private/${secret}?token=${secret}#${secret}`,
        ownerEmail: secret,
      },
    ]),
    [{ id: 'feed', name: 'Publisher', origin: 'https://feeds.publisher.org' }],
  );
  for (const method of ['GET', 'HEAD'])
    assert.equal(
      classifyPublicRoute(method, '/api/admin/topics/sources'),
      'public-read',
    );
});

void test('prepared source catalog rejects invalid or private origins with generic failures', async () => {
  const readers = [
    async () => {
      throw new Error(secret);
    },
    async () => null,
    ...[
      'http://feeds.publisher.org',
      'https://localhost/feed',
      'https://127.0.0.1/feed',
      'https://service.internal/feed',
      `https://owner:${secret}@feeds.publisher.org/feed`,
      'https://feeds.publisher.org:8443/feed',
      'javascript:alert(1)',
    ].map((url) => async () => [{ id: 'feed', name: 'Publisher', url }]),
  ];
  for (const read of readers) {
    await assert.rejects(readPublicSourceCatalog(read), (error: unknown) => {
      assert.ok(error instanceof ServiceUnavailableException);
      assert.deepEqual(error.getResponse(), {
        message: 'Source catalog unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
      return true;
    });
  }
});
