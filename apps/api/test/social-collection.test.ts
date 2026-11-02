import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectSocial } from '../src/modules/social/application/collect';
import type { SocialPost } from '../src/modules/social/domain/posts';

void test('free collection isolates river failures, persists verification cooldown and stops on embed failure', async () => {
  const stored: string[] = [];
  const checked: string[] = [];
  const failed: string[] = [];
  const discovered: string[] = [];
  const requested: string[] = [];
  const repository = {
    discoverySources: async () => [
      { id: 'bad', url: 'bad' },
      { id: 'ok', url: 'ok' },
    ],
    discoveryFailed: async (id: string) => {
      failed.push(id);
    },
    discovered: async (id: string) => {
      discovered.push(id);
    },
    refreshMissingTimes: async () => 0,
    candidates: async (limit: number) => {
      assert.deepEqual(articleChecks, ['article', 'unavailable']);
      assert.equal(limit, 10);
      return ['1', '2', '3'];
    },
    verificationUrl: async (id: string) => `https://x.com/author/status/${id}`,
    store: async (post: SocialPost) => {
      stored.push(post.externalId);
    },
    checked: async (id: string) => {
      checked.push(id);
    },
  };
  const articleChecks: string[] = [];
  const result = await collectSocial(
    repository,
    {
      collect: async (url) => {
        if (url === 'bad' || url === 'https://publisher.test/unavailable')
          throw new Error('Unavailable');
        return [{ externalId: '1', url: 'https://x.com/i/web/status/1' }];
      },
    },
    {
      verify: async (id, url) => {
        requested.push(id);
        assert.equal(url, `https://x.com/author/status/${id}`);
        if (id === '2') throw new Error('HTTP 429');
        return {
          platform: 'x',
          externalId: id,
          url: url,
          author: 'author',
          authorUrl: 'https://x.com/author',
          publishedAt: null,
          metrics: {},
          embedHtml: '',
        };
      },
    },
    {
      candidates: async () => [
        {
          id: 'article',
          url: 'https://publisher.test/article',
          host: 'publisher.test',
        },
        {
          id: 'unavailable',
          url: 'https://publisher.test/unavailable',
          host: 'publisher.test',
        },
      ],
      record: async (article, links) => {
        articleChecks.push(article.id);
        assert.equal(links === null, article.id === 'unavailable');
      },
    },
  );
  assert.deepEqual(result, {
    articleDiscovery: { checked: 1, citations: 1, errors: 1 },
    sources: 1,
    citations: 1,
    discoveryErrors: 1,
    verified: 1,
    verificationErrors: 1,
  });
  assert.deepEqual(failed, ['bad']);
  assert.deepEqual(discovered, ['ok']);
  assert.deepEqual(stored, ['1']);
  assert.deepEqual(checked, ['1', '2']);
  assert.deepEqual(requested, ['1', '2']);
});
