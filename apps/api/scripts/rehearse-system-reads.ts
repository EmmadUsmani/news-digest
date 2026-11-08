import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PostgresPreviewRepository } =
  require('../dist/modules/digests/database/preview.repository.js') as typeof import('../src/modules/digests/database/preview.repository');
const { PostgresTopicRepository } =
  require('../dist/modules/topics/database/topic.repository.js') as typeof import('../src/modules/topics/database/topic.repository');
const { PostgresProfileRepository } =
  require('../dist/modules/profiles/database/profile.repository.js') as typeof import('../src/modules/profiles/database/profile.repository');

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
  try {
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
        views.push({
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
      `Restored adapter reads verified: ${ids.rowCount} editions; both publication filters; off/on/off; topics and settings`,
    );
  } finally {
    await Promise.all([
      editions.onModuleDestroy(),
      topics.onModuleDestroy(),
      profiles.onModuleDestroy(),
    ]);
  }
}
void main().catch(() => {
  console.error(
    'Restored adapter comparison failed; private content suppressed',
  );
  process.exitCode = 1;
});
