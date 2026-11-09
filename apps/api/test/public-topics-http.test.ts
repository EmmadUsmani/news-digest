import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  PUBLIC_TOPICS,
  PublicTopicsController,
} from '../src/public-read/topics.controller';

void test('unregistered topics transport projects GET/HEAD and hides invalid state and storage errors', async () => {
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
  const expected = [topic];
  let value: unknown = [
    { ...topic, profileId: 'private-owner', futureColumn: 'private-token' },
  ];
  let failure = false;
  let reads = 0;
  @Module({
    controllers: [PublicTopicsController],
    providers: [
      {
        provide: PUBLIC_TOPICS,
        useValue: {
          read: async () => {
            reads++;
            if (failure) throw new Error('private-database-credential');
            return value;
          },
        },
      },
    ],
  })
  class TestModule {}
  const app = await NestFactory.create(TestModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}/api/admin/topics`;
  try {
    const get = await fetch(url);
    assert.equal(get.status, 200);
    assert.equal(get.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await get.json(), expected);
    const head = await fetch(url, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal(head.headers.get('cache-control'), 'no-store');
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const before = reads;
      assert.equal((await fetch(url, { method })).status, 404);
      assert.equal(reads, before);
    }
    for (const invalid of [
      undefined,
      [{ ...topic, storyBudget: 'private-invalid-budget' }],
      [topic, { ...topic, id: 'private-invalid-id' }],
    ]) {
      value = invalid;
      const response = await fetch(url);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), {
        message: 'Topic settings unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
    }
    failure = true;
    const response = await fetch(url);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      message: 'Topic settings unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
  } finally {
    await app.close();
  }
});
