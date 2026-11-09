import assert from 'node:assert/strict';
import test from 'node:test';

import { readPublicArticles } from '../src/public-read/articles';

const id = '00000000-0000-4000-8000-000000000001';
const privateMarker = 'private-stored-value';
const item = {
  id,
  title: 'Published headline',
  source: 'Publisher',
  publishedAt: '2026-11-09T08:00:00Z',
  url: `https://publisher.com/${privateMarker}?token=${privateMarker}`,
  profileId: privateMarker,
  metadata: { token: privateMarker },
};

void test('article projection preserves order and empty groups without leaking stored links or extra columns', async () => {
  const result = await readPublicArticles(async () => [
    { topicId: id, profileId: privateMarker, items: [item] },
    { topicId: id, items: [] },
  ]);
  assert.deepEqual(result, [
    {
      topicId: id,
      items: [
        {
          id,
          title: item.title,
          publisherOrigin: 'https://publisher.com',
          publishedAt: item.publishedAt,
          source: item.source,
        },
      ],
    },
    { topicId: id, items: [] },
  ]);
  assert.equal(JSON.stringify(result).includes(privateMarker), false);
});

void test('bad links produce null origins independently without rejecting valid article rows', async () => {
  const result = await readPublicArticles(async () => [
    {
      topicId: id,
      items: [null, 'https://localhost/private', {}, item.url].map((url) => ({
        ...item,
        url,
      })),
    },
  ]);
  assert.deepEqual(
    result[0].items.map((row) => row.publisherOrigin),
    [null, null, null, 'https://publisher.com'],
  );
});

void test('article storage and schema failures expose only a fixed unavailable response', async () => {
  for (const read of [
    async () => {
      throw new Error(privateMarker);
    },
    async () => [{ topicId: privateMarker, items: [item] }],
    async () => [{ topicId: id, items: [{ ...item, title: null }] }],
    async () => ({ internal: privateMarker }),
  ]) {
    await assert.rejects(readPublicArticles(read), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Articles unavailable');
      assert.equal(JSON.stringify(error).includes(privateMarker), false);
      return true;
    });
  }
});
