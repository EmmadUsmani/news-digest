import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  bookmarkLimit,
  changeBookmark,
  emptyStore,
  mergePreferences,
  parsePreferences,
} from '../../web/src/reader-preference-store';

const copy = {
  title: 'A saved story',
  url: 'https://example.org/story',
  attribution: 'Reporter',
  excerpt: 'Supplied text',
  platform: 'story',
  editionId: 'edition-one',
};
void test('legacy topic choices survive bookmark writes and JSON reload', () => {
  const legacy = parsePreferences(
    JSON.stringify({
      version: 1,
      hiddenTopics: { tech: { hidden: true, updatedAt: 10 } },
    }),
  );
  const saved = changeBookmark(legacy, 'story:one', copy, 20);
  assert.deepEqual(parsePreferences(JSON.stringify(saved)), saved);
  assert.equal(saved.hiddenTopics.tech.hidden, true);
  assert.equal(saved.bookmarks['story:one'].copy?.editionId, 'edition-one');
});
void test('removal survives stale-tab merge and clock rollback; explicit re-save wins', () => {
  const saved = changeBookmark(emptyStore(), 'story:one', copy, 20);
  const removed = changeBookmark(saved, 'story:one', null, 10);
  assert.equal(removed.bookmarks['story:one'].updatedAt, 21);
  const merged = mergePreferences(removed, saved);
  assert.equal(merged.bookmarks['story:one'].copy, null);
  assert.equal(
    changeBookmark(merged, 'story:one', copy, 5).bookmarks['story:one']
      .updatedAt,
    22,
  );
});
void test('display copies bound prose, reject unsafe or truncated destinations, and strip extra data', () => {
  const saved = changeBookmark(
    emptyStore(),
    'story:one',
    { ...copy, title: 'a'.repeat(1000), excerpt: 'b'.repeat(1000) },
    1,
  );
  assert.equal(saved.bookmarks['story:one'].copy?.title.length, 300);
  assert.equal(saved.bookmarks['story:one'].copy?.excerpt.length, 600);
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,hello',
    'https://user:password@example.org',
    'https://example.org/' + 'x'.repeat(2048),
  ]) {
    assert.throws(() =>
      changeBookmark(emptyStore(), 'story:one', { ...copy, url }, 1),
    );
  }
  const raw = JSON.stringify({
    ...saved,
    bookmarks: {
      'story:one': { updatedAt: 1, copy: { ...copy, privateField: 'discard' } },
    },
  });
  assert.equal(
    JSON.stringify(parsePreferences(raw)).includes('privateField'),
    false,
  );
});
void test('capacity counts tombstones and still permits remove and re-save at limit', () => {
  let store = emptyStore();
  for (let i = 0; i < bookmarkLimit; i++)
    store = changeBookmark(store, `story:${i}`, copy, 1);
  store = changeBookmark(store, 'story:0', null, 2);
  assert.throws(() => changeBookmark(store, 'story:new', copy, 3), /limit/);
  assert.ok(
    changeBookmark(store, 'story:0', copy, 3).bookmarks['story:0'].copy,
  );
  assert.equal(
    Object.keys(parsePreferences(JSON.stringify(store)).bookmarks).length,
    bookmarkLimit,
  );
});
void test('corrupt values and prototype-shaped identities cannot corrupt the store', () => {
  for (const raw of [
    '{',
    'null',
    '{"version":2}',
    '{"version":1,"bookmarks":[]}',
  ])
    assert.deepEqual(parsePreferences(raw), emptyStore());
  const saved = changeBookmark(emptyStore(), '__proto__', copy, 1);
  const restored = parsePreferences(JSON.stringify(saved));
  assert.equal(Object.getPrototypeOf(restored.bookmarks), Object.prototype);
  assert.equal(Object.hasOwn(restored.bookmarks, '__proto__'), true);
  assert.deepEqual(
    mergePreferences(emptyStore(), restored).bookmarks['__proto__'],
    restored.bookmarks['__proto__'],
  );
});

void test('out-of-range saved dates are discarded without losing valid bookmarks', () => {
  const restored = parsePreferences(
    JSON.stringify({
      version: 1,
      hiddenTopics: {},
      bookmarks: {
        'story:valid': { copy, updatedAt: 1234 },
        'story:invalid': { copy, updatedAt: Number.MAX_SAFE_INTEGER },
      },
    }),
  );
  assert.deepEqual(Object.keys(restored.bookmarks), ['story:valid']);
  assert.equal(
    new Date(restored.bookmarks['story:valid'].updatedAt).toISOString(),
    '1970-01-01T00:00:01.234Z',
  );
  assert.throws(() =>
    changeBookmark(
      emptyStore(),
      'story:invalid',
      copy,
      Number.MAX_SAFE_INTEGER,
    ),
  );
});
