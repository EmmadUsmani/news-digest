import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyPosts } from '../src/modules/social/application/verify-posts';
import type { SocialPost } from '../src/modules/social/domain/posts';

function setup() {
  const verified: string[] = [];
  const stored: string[] = [];
  const checked: [string, string | null][] = [];
  return {
    verified,
    stored,
    checked,
    repository: {
      verificationUrl: async (id: string) =>
        `https://x.com/fixture/status/${id}`,
      store: async (post: SocialPost) => {
        stored.push(post.externalId);
      },
      checked: async (id: string, error: string | null) => {
        checked.push([id, error]);
      },
    },
    embeds: {
      verify: async (id: string, url?: string): Promise<SocialPost> => {
        assert.equal(url, `https://x.com/fixture/status/${id}`);
        verified.push(id);
        return {
          platform: 'x',
          externalId: id,
          url: url,
          author: 'Fixture',
          authorUrl: 'https://x.com/fixture',
          publishedAt: null,
          metrics: {},
          embedHtml: '<p>Fixture</p>',
        };
      },
    },
  };
}
void test('official verification deduplicates and bounds requests, storing before success acknowledgement', async () => {
  const f = setup();
  const ids = Array.from({ length: 12 }, (_, n) => String(n + 1));
  const result = await verifyPosts(f.repository, f.embeds, ['1', ...ids]);
  assert.deepEqual(result, { verified: 10, verificationErrors: 0 });
  assert.deepEqual(f.verified, ids.slice(0, 10));
  assert.deepEqual(f.stored, f.verified);
  assert.deepEqual(
    f.checked,
    f.verified.map((id) => [id, null]),
  );
  f.repository.store = async () => {
    throw new Error('Storage failed');
  };
  f.checked.length = 0;
  await assert.rejects(
    verifyPosts(f.repository, f.embeds, ['12']),
    /Storage failed/,
  );
  assert.deepEqual(f.checked, []);
});
void test('unavailable official embed persists failure and stops without retrying or promoting a citation', async () => {
  const f = setup();
  f.embeds.verify = async () => {
    throw new Error('Secret provider response');
  };
  assert.deepEqual(await verifyPosts(f.repository, f.embeds, ['1', '2']), {
    verified: 0,
    verificationErrors: 1,
  });
  assert.deepEqual(f.stored, []);
  assert.deepEqual(f.checked, [['1', 'Official embed unavailable or invalid']]);
});
