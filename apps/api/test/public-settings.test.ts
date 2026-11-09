import assert from 'node:assert/strict';
import test from 'node:test';

import { ServiceUnavailableException } from '@nestjs/common';

import {
  readPublicSchedule,
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
  // Until transport and system-only wiring are audited, existing GETs stay admin.
  for (const method of ['GET', 'HEAD']) {
    for (const path of ['/api/admin/profile', '/api/admin/topics'])
      assert.equal(classifyPublicRoute(method, path), 'admin');
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
