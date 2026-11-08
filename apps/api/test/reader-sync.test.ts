import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mergePreferences } from '../../web/src/reader-preference-store';
import {
  mergeReaderSync,
  type ReaderSyncState,
} from '../src/modules/accounts/domain/reader-sync';

const empty = (): ReaderSyncState => ({
  version: 1,
  hiddenTopics: {},
  bookmarks: {},
});
const copy = {
  title: 'Story',
  url: 'https://example.test/story',
  attribution: 'Source',
  excerpt: '',
  platform: 'story',
  editionId: 'edition-1',
};

void test('sync converges with browser ordering, retains tombstones and does not mutate either input', () => {
  const a = empty();
  const b = empty();
  a.hiddenTopics.world = { hidden: true, updatedAt: 10 };
  b.hiddenTopics.world = { hidden: false, updatedAt: 10 };
  a.bookmarks.story = { copy, updatedAt: 10 };
  b.bookmarks.story = { copy: null, updatedAt: 10 };
  b.bookmarks.other = { copy: { ...copy, title: 'Other' }, updatedAt: 9 };
  const merged = mergeReaderSync(a, b);
  assert.deepEqual(merged, mergeReaderSync(b, a));
  assert.deepEqual(merged, mergePreferences(a, b));
  assert.deepEqual(mergeReaderSync(merged, a), merged);
  assert.equal(merged.bookmarks.story.copy, null);
  merged.bookmarks.other.copy!.title = 'Changed';
  assert.equal(b.bookmarks.other.copy!.title, 'Other');
  assert.equal(a.bookmarks.story.copy!.title, 'Story');
});

void test('newest changes win; display-copy ties and prototype-shaped keys match browser', () => {
  const a = empty();
  const b = empty();
  a.bookmarks = JSON.parse(
    JSON.stringify({ ['__proto__']: { copy, updatedAt: 1 } }),
  );
  b.bookmarks = {
    ['__proto__']: { copy: { ...copy, title: 'Z story' }, updatedAt: 1 },
  };
  b.hiddenTopics = { constructor: { hidden: false, updatedAt: 2 } };
  a.hiddenTopics = { constructor: { hidden: true, updatedAt: 1 } };
  assert.deepEqual(mergeReaderSync(a, b), mergePreferences(a, b));
  assert.deepEqual(mergeReaderSync(a, b), mergeReaderSync(b, a));
  assert.equal(
    Object.getPrototypeOf(mergeReaderSync(a, b).bookmarks),
    Object.prototype,
  );
});

void test('capacity includes removal records and rejects union overflow without discarding input', () => {
  for (const kind of ['bookmarks', 'hiddenTopics'] as const) {
    const a = empty();
    const change =
      kind === 'bookmarks'
        ? { copy: null, updatedAt: 1 }
        : { hidden: false, updatedAt: 1 };
    Object.assign(
      a[kind],
      Object.fromEntries(
        Array.from({ length: 1000 }, (_, i) => [String(i), change]),
      ),
    );
    assert.deepEqual(mergeReaderSync(a, a), a);
    const b = empty();
    Object.assign(b[kind], { extra: change });
    assert.throws(() => mergeReaderSync(a, b), /capacity/);
    assert.equal(Object.keys(a[kind]).length, 1000);
  }
});

void test('invalid sync is rejected rather than silently erasing entries', () => {
  for (const change of [
    { copy, updatedAt: -1 },
    { copy, updatedAt: Infinity },
    { copy, updatedAt: 1.5 },
    { copy: { ...copy, url: 'javascript:alert(1)' }, updatedAt: 1 },
    {
      copy: { ...copy, url: 'https://user:password@example.test/' },
      updatedAt: 1,
    },
    { copy: { ...copy, title: 'x'.repeat(301) }, updatedAt: 1 },
    { copy: { ...copy, excerpt: '\0' }, updatedAt: 1 },
    { updatedAt: 1 },
    { copy, updatedAt: 1, unexpected: 'unbounded data' },
  ])
    assert.throws(
      () =>
        mergeReaderSync(empty(), { ...empty(), bookmarks: { story: change } }),
      /Invalid/,
    );
  for (const key of ['', 'x'.repeat(401), '\0'])
    assert.throws(
      () =>
        mergeReaderSync(empty(), {
          ...empty(),
          bookmarks: { [key]: { copy: null, updatedAt: 1 } },
        }),
      /Invalid/,
    );
  assert.throws(
    () => mergeReaderSync(empty(), { ...empty(), version: 2 }),
    /Invalid/,
  );
});
