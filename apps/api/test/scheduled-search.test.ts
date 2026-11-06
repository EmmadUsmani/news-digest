import assert from 'node:assert/strict';
import { test } from 'node:test';

import { xSearchBody } from '../src/modules/social/adapters/historical-x-search';
import { planScheduledSearch } from '../src/modules/social/domain/scheduled-search';

const topic = (id: string, freePosts: number) => ({
  id,
  name: id,
  guidance: '',
  handles: ['NBA'],
  freePosts,
});
const edition = new Date('2026-11-03T15:00:00Z');
const now = new Date('2026-11-03T14:30:00Z');
void test('scheduled search chooses scarce free coverage with stable owner-order ties', () => {
  const result = planScheduledSearch(
    [topic('strong', 5), topic('weak', 0), topic('tie', 0)],
    now,
    edition,
  )!;
  assert.equal(result.topic.id, 'weak');
  assert.equal(result.scheduledDay, '2026-11-03');
  assert.equal(result.request.fromDate, '2026-11-02');
  assert.equal(result.request.toDate, '2026-11-04');
});
void test('scheduled search bounds the pre-edition window and fails closed without valid accounts', () => {
  for (const minutes of [31, 4, 0, -1])
    assert.equal(
      planScheduledSearch(
        [topic('a', 0)],
        new Date(edition.getTime() - minutes * 60000),
        edition,
      ),
      null,
    );
  assert.ok(
    planScheduledSearch(
      [topic('a', 0)],
      new Date(edition.getTime() - 5 * 60000),
      edition,
    ),
  );
  assert.equal(planScheduledSearch([], now, edition), null);
  for (const handles of [[], ['@NBA'], ['NBA', 'nba'], Array(21).fill('NBA')])
    assert.equal(
      planScheduledSearch([{ ...topic('a', 0), handles }], now, edition),
      null,
    );
  assert.equal(
    planScheduledSearch([topic('a', 0)], now, new Date('invalid')),
    null,
  );
  assert.equal(planScheduledSearch([topic('a', -1)], now, edition), null);
});

void test('scheduled search includes the partial current UTC day and exact edition interval', () => {
  const request = planScheduledSearch(
    [topic('world', 0)],
    now,
    edition,
  )!.request;
  const body = xSearchBody(request);
  assert.equal(body.tools[0].from_date, '2026-11-02');
  assert.equal(body.tools[0].to_date, '2026-11-04');
  assert.deepEqual(request.publicationWindow, {
    start: '2026-11-02T15:00:00.000Z',
    end: '2026-11-03T14:30:00.000Z',
  });
  assert.match(body.input[0].content, /start inclusive, end exclusive, in UTC/);
  assert.match(body.input[0].content, /2026-11-03T14:30:00.000Z/);
  // All five Nov 3 World discoveries preceded the actual edition window.
  // Synthetic boundary examples verify the corrected request's coverage.
  for (const stamp of [
    '2026-11-02T14:59:59Z',
    '2026-11-02T15:00:00Z',
    '2026-11-03T12:00:00Z',
  ]) {
    const time = Date.parse(stamp);
    assert.ok(
      time >= Date.parse(request.fromDate) && time < Date.parse(request.toDate),
    );
    assert.equal(
      time >= Date.parse(request.publicationWindow.start),
      stamp !== '2026-11-02T14:59:59Z',
    );
  }
});

void test('midnight needs no extra date and long windows stay bounded to one recent day', () => {
  const midnight = new Date('2026-11-04T00:00:00Z');
  const next = new Date('2026-11-04T00:10:00Z');
  const request = planScheduledSearch([topic('a', 0)], midnight, next)!.request;
  assert.equal(request.toDate, '2026-11-04');
  assert.equal(request.publicationWindow.start, '2026-11-03T00:10:00.000Z');
  const long = planScheduledSearch(
    [topic('a', 0)],
    now,
    edition,
    'open-topic',
    new Date('2026-10-01'),
  )!;
  assert.equal(
    long.request.publicationWindow.start,
    '2026-11-02T14:30:00.000Z',
  );
  assert.equal(
    planScheduledSearch([topic('a', 0)], now, edition, 'open-topic', now),
    null,
  );
});

void test('exact publication interval must fit valid tool date bounds', () => {
  const request = planScheduledSearch([topic('a', 0)], now, edition)!.request;
  for (const publicationWindow of [
    { start: 'invalid', end: now.toISOString() },
    { start: now.toISOString(), end: now.toISOString() },
    { start: '2026-11-01T23:59:59Z', end: now.toISOString() },
    { start: now.toISOString(), end: '2026-11-04T00:00:01Z' },
  ])
    assert.throws(
      () => xSearchBody({ ...request, publicationWindow }),
      /Invalid X search request/,
    );
});
