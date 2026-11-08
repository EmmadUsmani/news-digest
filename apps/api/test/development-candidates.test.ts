import assert from 'node:assert/strict';
import { test } from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import type { PostVerificationPort } from '../src/modules/social/domain/posts';
import type { XSearchPort } from '../src/modules/social/domain/x-search.port';
import { developmentXCandidates } from '../src/modules/social/public/development-candidates';
import { developmentSearch } from '../src/modules/social/public/development-search';

const start = new Date('2026-11-07T00:00:00Z');
const end = new Date('2026-11-08T00:00:00Z');
const policy = relevancePolicySchema.parse({
  includeAny: ['AI'],
  excludeAny: [],
});
const request = {
  topic: 'Technology',
  guidance: 'AI',
  fromDate: '2026-11-07',
  toDate: '2026-11-08',
};
const usage = {
  inputTokens: 1,
  outputTokens: 1,
  postsFetched: 0,
  profilesFetched: 0,
};
const link = (externalId: string) => ({
  externalId,
  url: `https://x.com/fixture/status/${externalId}`,
});
const embeds: PostVerificationPort = {
  async verify(externalId) {
    return {
      platform: 'x',
      ...link(externalId),
      author: 'Fixture',
      authorUrl: 'https://x.com/fixture',
      publishedAt: start.toISOString(),
      embedHtml: `<blockquote><p>AI official news ${externalId}</p></blockquote>`,
      metrics: {},
    };
  },
};

void test('development search candidates use official evidence, dedupe verification and tolerate missing embeds', async () => {
  const calls: string[] = [];
  const result = await developmentXCandidates(
    {
      async search() {
        return {
          usage,
          links: [
            link('1'),
            link('1'),
            link('2'),
            link('3'),
            link('4'),
            link('5'),
          ],
        };
      },
    },
    {
      async verify(id, url) {
        calls.push(id);
        assert.equal(url, link(id).url);
        if (id === '2') throw new Error('Unavailable');
        const post = await embeds.verify(id);
        if (id === '3') post.publishedAt = null;
        if (id === '4') post.externalId = 'different';
        if (id === '5')
          post.embedHtml = '<blockquote><p>Unrelated</p>AI footer</blockquote>';
        return post;
      },
    },
    request,
    policy,
    start,
    end,
    5,
  );
  assert.deepEqual(calls, ['1', '2', '3', '4', '5']);
  assert.equal(result.verified, 2);
  assert.equal(result.verificationErrors, 3);
  assert.deepEqual(
    result.posts.map((p) => p.externalId),
    ['1'],
  );
  assert.deepEqual(result.candidates.map((p) => p.externalId).sort(), [
    '1',
    '5',
  ]);
  assert.equal(result.posts[0].text, 'AI official news 1');
  assert.deepEqual(result.posts[0].metrics, {});
});

void test('development verification bounds network work and invalid budgets never search', async () => {
  let searches = 0;
  let verifications = 0;
  const search: XSearchPort = {
    async search() {
      searches++;
      return {
        usage,
        links: Array.from({ length: 100 }, (_, i) => link(String(i + 1))),
      };
    },
  };
  const verifier: PostVerificationPort = {
    async verify(id) {
      verifications++;
      return embeds.verify(id);
    },
  };
  for (const budget of [0, -1, 1.5, NaN]) {
    assert.deepEqual(
      await developmentXCandidates(
        search,
        verifier,
        request,
        policy,
        start,
        end,
        budget,
      ),
      { posts: [], candidates: [], verified: 0, verificationErrors: 0 },
    );
  }
  assert.equal(searches, 0);
  const result = await developmentXCandidates(
    search,
    verifier,
    request,
    policy,
    start,
    end,
    200,
  );
  assert.equal(searches, 1);
  assert.equal(verifications, 20);
  assert.equal(result.posts.length, 20);
});

void test('stopped or unconfirmed searches never verify or return partial candidates', async () => {
  let verifications = 0;
  const verifier: PostVerificationPort = {
    async verify(id) {
      verifications++;
      return embeds.verify(id);
    },
  };
  const stopped = developmentSearch(
    {
      async search() {
        return {
          status: 'complete',
          mustReport: true,
          value: { usage, links: [link('1')] },
        };
      },
    },
    'fixture',
  );
  await assert.rejects(
    developmentXCandidates(stopped, verifier, request, policy, start, end, 5),
    /report required/,
  );
  await assert.rejects(
    developmentXCandidates(
      {
        async search() {
          return { execution: 'unconfirmed', usage, links: [link('1')] };
        },
      },
      verifier,
      request,
      policy,
      start,
      end,
      5,
    ),
    /unconfirmed/,
  );
  assert.equal(verifications, 0);
});
