import 'reflect-metadata';

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

const require = createRequire(import.meta.url);
const { PostgresPreviewRepository } =
  require('../dist/modules/digests/database/preview.repository.js') as typeof import('../src/modules/digests/database/preview.repository');
const { PostgresTopicRepository } =
  require('../dist/modules/topics/database/topic.repository.js') as typeof import('../src/modules/topics/database/topic.repository');
const { PostgresProfileRepository } =
  require('../dist/modules/profiles/database/profile.repository.js') as typeof import('../src/modules/profiles/database/profile.repository');

const { ReaderEditionController } =
  require('../dist/modules/digests/reader-edition.controller.js') as typeof import('../src/modules/digests/reader-edition.controller');
const { PreviewRepository } =
  require('../dist/modules/digests/domain/preview.repository.js') as typeof import('../src/modules/digests/domain/preview.repository');

// Called only by the private restore harness, with its Unix-socket URL and no
// provider credentials. Never persist or print restored owner content.
async function main() {
  assert.equal(process.env.SYSTEM_READ_REHEARSAL, '1');
  assert.ok(
    new URL(process.env.DATABASE_URL!).searchParams
      .get('host')
      ?.startsWith('/tmp/news-digest-rehearsal-'),
  );
  const editions = new PostgresPreviewRepository();
  const topics = new PostgresTopicRepository();
  const profiles = new PostgresProfileRepository();
  // Minimal transport composition: the production controller and repository,
  // without queues, workers, ingestion or any provider adapters.
  class ReadModule {}
  Module({
    controllers: [ReaderEditionController],
    providers: [{ provide: PreviewRepository, useValue: editions }],
  })(ReadModule);
  const app = await NestFactory.create(ReadModule, { logger: false });
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const request = async (path: string) => {
      const response = await fetch(`${base}/api/editions${path}`);
      assert.ok([200, 404].includes(response.status), 'Reader response status');
      return {
        status: response.status,
        body: (await response.json()) as unknown,
      };
    };
    const readOnly = await editions.db.query<{
      default_transaction_read_only: string;
    }>('SHOW default_transaction_read_only');
    assert.equal(readOnly.rows[0]?.default_transaction_read_only, 'on');
    const ids = await editions.db.query<{ id: string }>(
      'SELECT id FROM digest_previews ORDER BY id',
    );
    const capture = async () => {
      const views = [];
      for (const published of [false, true]) {
        const pages = [];
        for (let offset = 0; ; offset += 20) {
          assert.ok(offset <= ids.rowCount! + 20, 'History terminates');
          const page = await editions.history(offset, published);
          pages.push(page);
          if (!page.hasMore) break;
        }
        process.env.READER_PUBLISHED_ONLY = published ? '1' : '0';
        const httpPages = [];
        for (let offset = 0; ; offset += 20) {
          assert.ok(offset <= ids.rowCount! + 20, 'HTTP history terminates');
          const page = await request(`?offset=${offset}`);
          assert.equal(page.status, 200);
          httpPages.push(page);
          if (!(page.body as { hasMore: boolean }).hasMore) break;
        }
        const http = {
          latest: await request('/latest'),
          pages: httpPages,
          direct: await Promise.all(
            ids.rows.map(({ id }) => request(`/${id}`)),
          ),
        };
        views.push({
          http,
          latest: await editions.latest(published),
          pages,
          direct: await Promise.all(
            ids.rows.map(({ id }) => editions.find(id, published)),
          ),
        });
      }
      return {
        views,
        topics: await topics.listDefault(),
        settings: await profiles.getDefault(),
      };
    };
    delete process.env.SYSTEM_OWNERSHIP;
    const before = await capture();
    process.env.SYSTEM_OWNERSHIP = '1';
    assert.deepEqual(
      await capture(),
      before,
      'System reads preserve every complete edition, history, topics and settings',
    );
    delete process.env.SYSTEM_OWNERSHIP;
    assert.deepEqual(
      await capture(),
      before,
      'Flag rollback preserves all reads',
    );
    console.log(
      `Restored adapter and reader HTTP reads verified: ${ids.rowCount} editions; both publication filters; off/on/off; topics and settings`,
    );
  } finally {
    await app.close();
    await Promise.all([topics.onModuleDestroy(), profiles.onModuleDestroy()]);
  }
}
void main().catch(() => {
  console.error(
    'Restored adapter comparison failed; private content suppressed',
  );
  process.exitCode = 1;
});
