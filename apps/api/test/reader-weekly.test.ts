import assert from 'node:assert/strict';
import test from 'node:test';

import type { WeeklyPublication } from '../src/modules/digests/application/generate-weekly-review';
import { ReaderWeeklyController } from '../src/modules/digests/reader-weekly.controller';
import { classifyPublicRoute } from '../src/public-route-policy';

const id = '00000000-0000-4000-8000-000000000001';
const snapshot: WeeklyPublication = {
  id,
  profileId: null,
  kind: 'weekly',
  windowStart: '2026-11-16',
  windowEnd: '2026-11-23',
  topics: [
    {
      id,
      name: 'Tech',
      review: {
        windowStart: '2026-11-16',
        windowEnd: '2026-11-23',
        model: 'private-model',
        stories: [
          {
            title: 'A week of news',
            summary: 'The saved weekly summary.',
            coverage: [
              {
                reference: 'd0:s0',
                kind: 'story',
                editionId: id,
                itemId: 'story-1',
                publishedAt: '2026-11-16',
                title: 'Daily headline',
                text: 'Private evidence text',
                url: 'https://example.com/report',
              },
            ],
          },
        ],
      },
    },
    { id, name: 'Quiet', review: null },
  ],
};

void test('weekly reader scopes all reads to public publications and strips private evidence', async () => {
  const controller = new ReaderWeeklyController({
    findById: async (key, profile) => {
      assert.equal(profile, null);
      return key === id ? structuredClone(snapshot) : null;
    },
    history: async (profile, offset) => {
      assert.equal(profile, null);
      assert.equal(offset, 20);
      return { entries: [structuredClone(snapshot)], nextOffset: 40 };
    },
  });
  const result = await controller.find(id);
  assert.equal(result.kind, 'weekly');
  assert.equal(
    result.topics[0].stories[0].summary,
    'The saved weekly summary.',
  );
  assert.equal(result.topics[0].stories[0].coverage[0].editionId, id);
  assert.deepEqual(result.topics[1].stories, []);
  for (const hidden of [
    'profileId',
    'private-model',
    'Private evidence text',
    'reference',
    'review',
  ])
    assert.ok(!JSON.stringify(result).includes(hidden), hidden);
  assert.ok(snapshot.topics[0].review?.model);
  const history = await controller.history('20');
  assert.equal(history.nextOffset, 40);
  assert.deepEqual(history.entries[0].topics, [
    { id, name: 'Tech' },
    { id, name: 'Quiet' },
  ]);
  assert.ok(!JSON.stringify(history).includes('summary'));
  await assert.rejects(controller.find('absent'), { status: 404 });
  for (const offset of ['-1', '1.5', '01', '10000000', 'NaN'])
    await assert.rejects(controller.history(offset), { status: 400 });
});

void test('weekly public admission allows history and UUID reads only', () => {
  for (const path of ['/api/weekly-editions', `/api/weekly-editions/${id}`]) {
    assert.equal(classifyPublicRoute('GET', path), 'public-read');
    assert.notEqual(classifyPublicRoute('POST', path), 'public-read');
  }
  assert.notEqual(
    classifyPublicRoute('GET', '/api/weekly-editions/latest'),
    'public-read',
  );
});

void test('weekly HTTP transport validates UUIDs and offsets and supports anonymous HEAD reads', async () => {
  const { createRequire } = await import('node:module');
  const { NestFactory } = await import('@nestjs/core');
  const require = createRequire(import.meta.url);
  const {
    ReaderWeeklyController: Controller,
  } = require('../dist/modules/digests/reader-weekly.controller.js');
  const {
    WeeklyPublicationReader,
  } = require('../dist/modules/digests/application/weekly-publication-reader.js');
  let reads = 0;
  const app = await NestFactory.create(
    {
      module: class WeeklyTestModule {},
      controllers: [Controller],
      providers: [
        {
          provide: WeeklyPublicationReader,
          useValue: {
            history: async (profile: unknown) => {
              assert.equal(profile, null);
              reads++;
              return { entries: [snapshot], nextOffset: null };
            },
            findById: async (key: string, profile: unknown) => {
              assert.equal(profile, null);
              reads++;
              return key === id ? snapshot : null;
            },
          },
        },
      ],
    },
    { logger: false },
  );
  try {
    await app.listen(0, '127.0.0.1');
    const url = `${await app.getUrl()}/api/weekly-editions`;
    const history = await fetch(url);
    assert.equal(history.status, 200);
    assert.equal(history.headers.get('cache-control'), 'no-store');
    assert.equal((await history.json()).entries[0].kind, 'weekly');
    const detail = await fetch(`${url}/${id}`);
    assert.equal(detail.status, 200);
    assert.ok(!(await detail.text()).includes('private-model'));
    const head = await fetch(`${url}/${id}`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const before = reads;
    assert.equal((await fetch(`${url}?offset=-1`)).status, 400);
    assert.equal((await fetch(`${url}/invalid`)).status, 400);
    assert.equal(reads, before);
    assert.equal(
      (await fetch(`${url}/00000000-0000-4000-8000-000000000002`)).status,
      404,
    );
    assert.equal((await fetch(url, { method: 'POST' })).status, 404);
  } finally {
    await app.close();
  }
});
