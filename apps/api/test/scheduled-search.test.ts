import assert from 'node:assert/strict';
import { test } from 'node:test';

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
  assert.equal(result.request.toDate, '2026-11-03');
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
