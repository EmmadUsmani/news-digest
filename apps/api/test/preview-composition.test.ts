import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

const require = createRequire(import.meta.url);
const { DigestsModule } =
  require('../dist/modules/digests/digests.module.js') as typeof import('../src/modules/digests/digests.module');
const { EditionJobs } =
  require('../dist/modules/digests/domain/edition-jobs.js') as typeof import('../src/modules/digests/domain/edition-jobs');
const { PreviewRepository } =
  require('../dist/modules/digests/domain/preview.repository.js') as typeof import('../src/modules/digests/domain/preview.repository');

@Module({})
class Harness {}

void test('digest composition switches only reads and preserves private operations', async () => {
  for (const enabled of ['0', '1']) {
    const calls: unknown[] = [];
    const composition = DigestsModule.prepare({
      PUBLIC_MODE: enabled,
      SYSTEM_OWNERSHIP: '1',
      READER_PUBLISHED_ONLY: '1',
    });
    const app = await NestFactory.create(
      {
        ...composition,
        module: Harness,
        providers: [
          ...(composition.providers ?? []),
          {
            provide: PreviewRepository,
            useValue: {
              async history(offset: number, published: boolean) {
                calls.push([offset, published]);
                return { entries: [], hasMore: false };
              },
              async latest(published: boolean) {
                calls.push(published);
                return null;
              },
              async find() {
                return {};
              },
              async cost() {
                return { marker: 'private-cost' };
              },
            },
          },
          {
            provide: EditionJobs,
            useValue: {
              async find(id: string) {
                return { id };
              },
            },
          },
        ],
      },
      { logger: false },
    );
    try {
      await app.listen(0, '127.0.0.1');
      const base = `${await app.getUrl()}/api/admin/digest-previews`;
      const history = await fetch(base + '?offset=2');
      assert.equal(history.status, 200);
      assert.deepEqual(await history.json(), { entries: [], hasMore: false });
      assert.equal((await fetch(base + '/latest')).status, 200);
      assert.deepEqual(calls, [
        [2, enabled === '1' ? true : undefined],
        enabled === '1' ? true : undefined,
      ]);
      const cost = await fetch(
        base + '/00000000-0000-4000-8000-000000000001/cost',
      );
      assert.deepEqual(await cost.json(), { marker: 'private-cost' });
      assert.equal(
        (
          await fetch(base, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}',
          })
        ).status,
        400,
      );
      assert.equal((await fetch(base + '/jobs/invalid')).status, 404);
    } finally {
      await app.close();
    }
  }
});
