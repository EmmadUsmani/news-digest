import assert from 'node:assert/strict';
import test from 'node:test';

import { database } from '../src/libs/db/connections';
import { PostgresReaderSyncRepository } from '../src/modules/accounts/database/reader-sync.repository';
import type { ReaderSyncState } from '../src/modules/accounts/domain/reader-sync';

const empty = (): ReaderSyncState => ({
  version: 1,
  hiddenTopics: {},
  bookmarks: {},
});
void test('reader sync serializes devices, preserves tombstones and isolates capacity failures', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const pool = database();
  const first = new PostgresReaderSyncRepository();
  const second = new PostgresReaderSyncRepository();
  const ids: string[] = [];
  try {
    const result = await pool.query(
      "INSERT INTO users(email) VALUES ('sync-owner@example.test'),('sync-other@example.test') RETURNING id",
    );
    ids.push(...result.rows.map((r: { id: string }) => r.id));
    const change = (key: string, time: number): ReaderSyncState => ({
      ...empty(),
      hiddenTopics: { [key]: { hidden: true, updatedAt: time } },
      bookmarks: { [key]: { copy: null, updatedAt: time } },
    });
    await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        (i % 2 ? first : second).merge(ids[0], change(`key:${i}`, i + 1)),
      ),
    );
    const saved = empty();
    saved.bookmarks['story:copy'] = {
      updatedAt: 1720000000123,
      copy: {
        title: 'Historical story',
        url: 'https://example.test/story',
        attribution: 'Source',
        excerpt: 'Saved excerpt',
        platform: 'story',
        editionId: 'old-edition',
      },
    };
    await first.merge(ids[0], saved);
    const state = await first.merge(ids[0], empty());
    assert.equal(Object.keys(state.bookmarks).length, 13);
    assert.equal(Object.keys(state.hiddenTopics).length, 12);
    assert.equal(state.bookmarks['key:11'].updatedAt, 12);
    assert.equal(state.bookmarks['key:11'].copy, null);
    assert.deepEqual(
      state.bookmarks['story:copy'],
      saved.bookmarks['story:copy'],
    );
    assert.deepEqual(await second.merge(ids[1], empty()), empty());
    await first.merge(ids[0], change('key:11', 1));
    assert.deepEqual(await first.merge(ids[0], empty()), state);
    const full = empty();
    full.bookmarks = Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [
        `capacity:${i}`,
        { copy: null, updatedAt: 1 },
      ]),
    );
    await assert.rejects(second.merge(ids[0], full), /capacity/);
    await assert.rejects(first.merge(ids[0], { version: 2 }), /Invalid/);
    assert.deepEqual(await first.merge(ids[0], empty()), state);
    // Fail after deletes/inserts have begun: transaction must restore both tables.
    await pool.query(
      `CREATE FUNCTION reject_sync_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.item_key = 'fail-write' THEN RAISE EXCEPTION 'injected sync failure'; END IF; RETURN NEW; END $$`,
    );
    await pool.query(
      'CREATE TRIGGER reject_sync_test BEFORE INSERT ON bookmarks FOR EACH ROW EXECUTE FUNCTION reject_sync_test()',
    );
    await assert.rejects(
      second.merge(ids[0], change('fail-write', 50)),
      (error: unknown) =>
        error instanceof Error &&
        error.cause instanceof Error &&
        error.cause.message.includes('injected sync failure'),
    );
    assert.deepEqual(await first.merge(ids[0], empty()), state);
    await pool.query('DROP TRIGGER reject_sync_test ON bookmarks');
    await pool.query('DROP FUNCTION reject_sync_test()');
    // An in-flight sync waits for identity deletion and then fails closed.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM users WHERE id=$1', [ids[0]]);
      const pending = assert.rejects(
        second.merge(ids[0], empty()),
        /unavailable/,
      );
      await client.query('COMMIT');
      await pending;
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
    assert.deepEqual(await first.merge(ids[1], empty()), empty());
  } finally {
    await pool.query('DROP TRIGGER IF EXISTS reject_sync_test ON bookmarks');
    await pool.query('DROP FUNCTION IF EXISTS reject_sync_test()');
    await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])', [ids]);
    await Promise.all([
      first.onModuleDestroy(),
      second.onModuleDestroy(),
      pool.end(),
    ]);
  }
});
