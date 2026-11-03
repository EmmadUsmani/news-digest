import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectBluesky } from '../src/modules/social/application/collect-bluesky';
import type {
  BlueskyPost,
  BlueskyRepository,
} from '../src/modules/social/domain/bluesky';

const start = new Date('2026-11-02T12:00:00Z');
const end = new Date('2026-11-03T12:00:00Z');
const now = () => new Date('2026-11-03T12:01:00Z');
const post = (
  externalId: string,
  changes: Partial<BlueskyPost> = {},
): BlueskyPost => ({
  platform: 'bluesky',
  externalId,
  url: 'https://bsky.app/profile/example/post/123',
  author: 'example.bsky.social',
  text: 'AI demo',
  publishedAt: start.toISOString(),
  observedAt: end.toISOString(),
  metrics: { likes: 10, reposts: 1, replies: 0 },
  ...changes,
});
function storage() {
  const writes: { topicId: string; posts: BlueskyPost[] }[] = [];
  const repository: BlueskyRepository = {
    async store(topicId, posts) {
      writes.push({ topicId, posts });
    },
    async observations() {
      throw new Error('Collection must not read candidates');
    },
  };
  return { repository, writes };
}

void test('collection bounds storage, keeps latest duplicate and rejects invalid window/metrics snapshots', async () => {
  const { repository, writes } = storage();
  const posts = [
    post('duplicate'),
    post('duplicate', { observedAt: now().toISOString(), text: 'latest' }),
    post('before', {
      publishedAt: new Date(start.getTime() - 1).toISOString(),
    }),
    post('end', { publishedAt: end.toISOString() }),
    post('future', { observedAt: new Date(now().getTime() + 1).toISOString() }),
    post('invalid', { metrics: { likes: -1, reposts: 0, replies: 0 } }),
    post('invalid-time', { observedAt: 'bad' }),
    post('pre-publication', {
      observedAt: new Date(start.getTime() - 1).toISOString(),
    }),
    ...Array.from({ length: 60 }, (_, i) => post(`extra${i}`)),
  ];
  let requests = 0;
  const result = await collectBluesky(
    repository,
    {
      async search(query, from, to) {
        requests++;
        assert.equal(query, 'AI');
        assert.equal(from, start);
        assert.equal(to, end);
        return posts;
      },
    },
    'topic',
    'AI',
    start,
    end,
    now,
  );
  assert.equal(requests, 1);
  assert.deepEqual(result, {
    fetched: posts.length,
    submitted: 43,
    cutoff: now(),
  });
  assert.equal(writes.length, 1);
  assert.equal(writes[0].topicId, 'topic');
  assert.equal(writes[0].posts[0].text, 'latest');
  assert.equal(writes[0].posts.at(-1)?.externalId, 'extra41');
});

void test('invalid collection requests perform no network or storage work', async () => {
  const { repository, writes } = storage();
  const search = {
    async search(): Promise<BlueskyPost[]> {
      assert.fail('Unexpected search');
    },
  };
  for (const [topic, query, from, to] of [
    ['', 'AI', start, end],
    ['topic', '', start, end],
    ['topic', 'x'.repeat(501), start, end],
    ['topic', 'AI', end, start],
    ['topic', 'AI', new Date('bad'), end],
    ['topic', 'AI', new Date(start.getTime() - 1), end],
    ['topic', 'AI', start, new Date(now().getTime() + 1)],
  ] as const) {
    await assert.rejects(
      collectBluesky(repository, search, topic, query, from, to, now),
      /Invalid Bluesky/,
    );
  }
  assert.equal(writes.length, 0);
});

void test('collection propagates search and transaction failures without retrying', async () => {
  const { repository, writes } = storage();
  await assert.rejects(
    collectBluesky(
      repository,
      {
        async search() {
          throw new Error('rate limited');
        },
      },
      'topic',
      'AI',
      start,
      end,
      now,
    ),
    /rate limited/,
  );
  assert.equal(writes.length, 0);
  let attempts = 0;
  repository.store = async () => {
    attempts++;
    throw new Error('rollback');
  };
  await assert.rejects(
    collectBluesky(
      repository,
      {
        async search() {
          return [post('one')];
        },
      },
      'topic',
      'AI',
      start,
      end,
      now,
    ),
    /rollback/,
  );
  assert.equal(attempts, 1);
});
