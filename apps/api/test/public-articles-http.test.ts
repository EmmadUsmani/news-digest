import 'reflect-metadata';

import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  PUBLIC_ARTICLES,
  PublicArticlesController,
} from '../src/public-read/articles.controller';
import { PublicArticlesModule } from '../src/public-read/articles.module';

void test('unregistered articles transport projects GET/HEAD and hides invalid state and storage errors', async () => {
  const topic = {
    topicId: '00000000-0000-4000-8000-000000000002',
    items: [
      {
        id: '00000000-0000-4000-8000-000000000003',
        title: 'Headline',
        source: 'Publisher',
        publishedAt: '2026-11-09T08:00:00Z',
        publisherOrigin: 'https://publisher.com',
      },
    ],
  };
  const expected = [topic];
  let value: unknown = [
    {
      ...topic,
      profileId: 'private-owner',
      futureColumn: 'private-token',
      items: [
        {
          ...topic.items[0],
          url: 'https://private.example/secret',
          futureColumn: 'private-token',
          publisherOrigin: 'https://publisher.com/private?secret=private-token',
        },
      ],
    },
  ];
  let failure = false;
  let reads = 0;
  @Module({
    controllers: [PublicArticlesController],
    providers: [
      {
        provide: PUBLIC_ARTICLES,
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
  const url = `http://127.0.0.1:${address.port}/api/admin/content`;
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
      [{ ...topic, items: [{ ...topic.items[0], title: null }] }],
      [topic, { ...topic, topicId: 'private-invalid-id' }],
    ]) {
      value = invalid;
      const response = await fetch(url);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), {
        message: 'Articles unavailable',
        error: 'Service Unavailable',
        statusCode: 503,
      });
    }
    value = [
      {
        ...topic,
        items: [
          { ...topic.items[0], publisherOrigin: 'https://localhost/private' },
        ],
      },
      { ...topic, items: [] },
    ];
    const filtered = await fetch(url);
    assert.equal(filtered.status, 200);
    assert.deepEqual(await filtered.json(), [
      { ...topic, items: [{ ...topic.items[0], publisherOrigin: null }] },
      { ...topic, items: [] },
    ]);
    failure = true;
    const response = await fetch(url);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      message: 'Articles unavailable',
      error: 'Service Unavailable',
      statusCode: 503,
    });
  } finally {
    await app.close();
  }
});

void test('public articles composition stays dependency-free when disabled and rejects unsafe enablement', async () => {
  let calls = 0;
  const getPool = () => {
    calls++;
    throw new Error('Must not open storage');
  };
  for (const env of [{}, { PUBLIC_MODE: '0', SYSTEM_OWNERSHIP: 'invalid' }]) {
    const app = await NestFactory.create(
      PublicArticlesModule.prepare(env, getPool),
      { logger: false },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address() as AddressInfo;
      assert.equal(
        (await fetch(`http://127.0.0.1:${address.port}/api/admin/content`))
          .status,
        404,
      );
    } finally {
      await app.close();
    }
  }
  for (const env of [
    { PUBLIC_MODE: 'true' },
    { PUBLIC_MODE: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '1' },
    { PUBLIC_MODE: '1', READER_PUBLISHED_ONLY: '1' },
    { PUBLIC_MODE: '1', SYSTEM_OWNERSHIP: '0', READER_PUBLISHED_ONLY: '1' },
  ])
    assert.throws(() => PublicArticlesModule.prepare(env, getPool));
  assert.equal(calls, 0);
});
