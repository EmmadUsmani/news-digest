import assert from 'node:assert/strict';
import { test } from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import { developmentEditionX } from '../src/modules/social/public/development-edition';

const start = new Date('2026-11-07T12:30:00Z');
const end = new Date('2026-11-08T12:30:00Z');
const policy = relevancePolicySchema.parse({
  includeAny: ['AI'],
  excludeAny: [],
});
const request = {
  topic: 'Tech',
  guidance: 'AI',
  fromDate: 'stale',
  toDate: 'stale',
};
const usage = {
  inputTokens: 1,
  outputTokens: 1,
  postsFetched: 0,
  profilesFetched: 0,
};

void test('edition composition shares concurrent topic discovery and pins exact windows', async () => {
  let searches = 0;
  let verifies = 0;
  const edition = developmentEditionX(
    {
      async search(actual, id) {
        searches++;
        assert.equal(id, 'edition:search:1');
        assert.equal(actual.fromDate, '2026-11-07');
        assert.equal(actual.toDate, '2026-11-08');
        assert.deepEqual(actual.publicationWindow, {
          start: start.toISOString(),
          end: end.toISOString(),
        });
        return {
          status: 'complete',
          mustReport: false,
          value: {
            usage,
            links: [{ externalId: '1', url: 'https://x.com/fixture/status/1' }],
          },
        };
      },
    },
    {
      async verify(externalId) {
        verifies++;
        return {
          platform: 'x',
          externalId,
          url: 'https://x.com/fixture/status/1',
          author: 'Fixture',
          authorUrl: 'https://x.com/fixture',
          publishedAt: start.toISOString(),
          embedHtml: '<blockquote><p>AI launch</p></blockquote>',
          metrics: {},
        };
      },
    },
    'edition',
  );
  const select = () =>
    edition.candidates('tech', request, policy, start, end, 5);
  const [first, second] = await Promise.all([select(), select()]);
  assert.equal(searches, 1);
  assert.equal(verifies, 1);
  assert.equal(first.posts.length, 1);
  first.posts.length = 0;
  assert.equal(second.posts.length, 1);
  assert.equal((await select()).posts.length, 1);
  assert.throws(
    () => edition.candidates('tech', request, policy, start, end, 6),
    /Conflicting/,
  );
  assert.equal(request.fromDate, 'stale');
});

void test('edition composition keeps refused topics stopped across concurrent calls and replays', async () => {
  let searches = 0;
  const edition = developmentEditionX(
    {
      async search() {
        searches++;
        return { status: 'budget-refused', mustReport: true };
      },
    },
    {
      async verify() {
        throw new Error('Must not verify');
      },
    },
    'edition',
  );
  const select = (id: string) =>
    edition.candidates(id, request, policy, start, end, 5);
  const results = await Promise.allSettled([
    select('tech'),
    select('world'),
    select('tech'),
  ]);
  assert.ok(results.every((result) => result.status === 'rejected'));
  await assert.rejects(select('world'), /stopped/);
  assert.equal(searches, 1);
  assert.throws(
    () => edition.candidates('bad', request, policy, end, start, 5),
    /window/,
  );
});
