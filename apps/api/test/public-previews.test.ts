import assert from 'node:assert/strict';
import { test } from 'node:test';

import { type DigestPreview } from '@digest/contracts';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import { PublicPreviewReads } from '../src/public-read/previews';
import { classifyPublicRoute } from '../src/public-route-policy';

const id = '00000000-0000-4000-8000-000000000001';
const secret = 'private-provider-token';
const snapshot: DigestPreview = {
  id,
  createdAt: '2026-11-10T15:00:00Z',
  windowStart: '2026-11-09T15:00:00Z',
  windowEnd: '2026-11-10T15:00:00Z',
  method: secret,
  topics: [{ id, name: 'Tech', candidateCount: 15, stories: [] }],
};

void test('prepared preview reads force published storage and expose only reader contracts', async () => {
  const calls: unknown[] = [];
  const reads = new PublicPreviewReads({
    async history(offset, published) {
      calls.push(['history', offset, published]);
      return {
        entries: [
          {
            ...snapshot,
            topicModes: [{ id, name: 'Tech', stories: 'ai', posts: null }],
          },
        ],
        hasMore: true,
      };
    },
    async latest(published) {
      calls.push(['latest', published]);
      return snapshot;
    },
    async find(key, published) {
      calls.push(['find', key, published]);
      return key === id ? snapshot : null;
    },
  });
  const history = await reads.history('20');
  assert.deepEqual(history, {
    entries: [
      {
        id,
        createdAt: snapshot.createdAt,
        windowStart: snapshot.windowStart,
        windowEnd: snapshot.windowEnd,
        topics: [{ id, name: 'Tech' }],
      },
    ],
    hasMore: true,
  });
  const latest = await reads.latest();
  assert.deepEqual(await reads.find(id), latest);
  assert.doesNotMatch(
    JSON.stringify([history, latest]),
    /private-|candidateCount|method|topicModes/,
  );
  await assert.rejects(reads.find('missing'), NotFoundException);
  assert.deepEqual(calls, [
    ['history', 20, true],
    ['latest', true],
    ['find', id, true],
    ['find', 'missing', true],
  ]);
  for (const offset of ['-1', '01', '1e2', '10000000', secret])
    assert.throws(() => reads.history(offset), /Invalid offset/);
  assert.equal(calls.length, 4);
});

void test('prepared preview failures conceal storage/schema details and preserve empty results', async () => {
  const empty = new PublicPreviewReads({
    history: async () => ({ entries: [], hasMore: false }),
    latest: async () => null,
    find: async () => null,
  });
  assert.equal(await empty.latest(), null);
  assert.deepEqual(await empty.history(), { entries: [], hasMore: false });
  for (const malformed of [false, true]) {
    const fail = async () => {
      if (malformed)
        return { ...snapshot, topics: null } as unknown as DigestPreview;
      throw new Error(secret);
    };
    const reads = new PublicPreviewReads({
      latest: fail,
      find: fail,
      history: async () => {
        throw new Error(secret);
      },
    });
    for (const read of [
      () => reads.latest(),
      () => reads.find(id),
      () => reads.history(),
    ])
      await assert.rejects(read(), (error: unknown) => {
        assert.ok(error instanceof ServiceUnavailableException);
        assert.equal(error.message, 'Editions unavailable');
        assert.doesNotMatch(
          JSON.stringify(error.getResponse()),
          /private-provider-token/,
        );
        return true;
      });
  }
  for (const path of [
    '/api/admin/digest-previews',
    '/api/admin/digest-previews/latest',
    `/api/admin/digest-previews/${id}`,
    `/api/admin/digest-previews/${id}/cost`,
    '/api/admin/digest-previews/jobs/1',
  ])
    assert.equal(classifyPublicRoute('GET', path), 'admin');
});
