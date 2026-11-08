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

void test('simultaneous bookmark changes converge across merge order without resurrecting removals', () => {
  const saved = changeBookmark(emptyStore(), 'story:one', copy, 20);
  const removed = changeBookmark(emptyStore(), 'story:one', null, 20);
  assert.deepEqual(
    mergePreferences(saved, removed),
    mergePreferences(removed, saved),
  );
  assert.equal(
    mergePreferences(removed, saved).bookmarks['story:one'].copy,
    null,
  );
  const alternative = changeBookmark(
    emptyStore(),
    'story:one',
    { ...copy, title: 'Other copy' },
    20,
  );
  assert.deepEqual(
    mergePreferences(saved, alternative),
    mergePreferences(alternative, saved),
  );
  assert.ok(
    changeBookmark(mergePreferences(removed, saved), 'story:one', copy, 21)
      .bookmarks['story:one'].copy,
  );
});

void test('concurrent saves at capacity survive reload without dropping removals', () => {
  const base = emptyStore();
  for (let i = 0; i < bookmarkLimit - 1; i++)
    base.bookmarks[`story:removed-${i}`] = { copy: null, updatedAt: 1 };
  const left = changeBookmark(base, 'story:left', copy, 2);
  const right = changeBookmark(base, 'story:right', copy, 3);
  const union = mergePreferences(left, right);
  const restored = parsePreferences(JSON.stringify(union));
  assert.deepEqual(restored, union);
  assert.throws(() => changeBookmark(restored, 'story:new', copy, 4), /limit/);
  const removed = changeBookmark(restored, 'story:right', null, 4);
  assert.equal(
    parsePreferences(JSON.stringify(removed)).bookmarks['story:right'].copy,
    null,
  );
  assert.equal(
    mergePreferences(left, removed).bookmarks['story:right'].copy,
    null,
  );
});

void test('shortened saved prose marks omissions, preserves words and survives reload', () => {
  const excerpt = 'Reporting from the published edition. '.repeat(30);
  const saved = changeBookmark(
    emptyStore(),
    'story:long',
    { ...copy, excerpt },
    1,
  );
  const shortened = saved.bookmarks['story:long'].copy!.excerpt;
  assert.ok(shortened.length <= 600);
  assert.ok(shortened.endsWith('…'));
  assert.ok(excerpt.startsWith(shortened.slice(0, -1)));
  assert.match(excerpt.slice(shortened.length - 1), /^\s/u);
  assert.deepEqual(parsePreferences(JSON.stringify(saved)), saved);
  assert.equal(
    changeBookmark(emptyStore(), 'story:short', copy, 1).bookmarks[
      'story:short'
    ].copy?.excerpt,
    copy.excerpt,
  );
  const emoji = changeBookmark(
    emptyStore(),
    'story:emoji',
    { ...copy, title: '😀'.repeat(200) },
    1,
  ).bookmarks['story:emoji'].copy!.title;
  assert.ok(emoji.endsWith('…'));
  assert.doesNotMatch(emoji, /[\uD800-\uDBFF]…$/u);
});
