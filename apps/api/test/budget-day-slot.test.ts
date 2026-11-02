import assert from 'node:assert/strict';
import { test } from 'node:test';

import { budgetDaySlot } from '../src/modules/profiles/adapters/budget-day-slot';
import type { ScheduleConfig } from '../src/modules/profiles/domain/schedule';

const schedule: ScheduleConfig = {
  cadence: '0 7 * * *',
  timezone: 'America/Los_Angeles',
  coverageWindow: 'P1D',
  storyBudget: 5,
  postBudget: 5,
};
const slot = (day: string, changes: Partial<ScheduleConfig> = {}) =>
  budgetDaySlot(day, { ...schedule, ...changes })?.toISOString() ?? null;

void test('UTC budget identity follows the configured local schedule across DST', () => {
  assert.equal(slot('2026-10-31'), '2026-10-31T14:00:00.000Z');
  assert.equal(slot('2026-11-01'), '2026-11-01T15:00:00.000Z');
  assert.equal(slot('2026-11-03'), '2026-11-03T15:00:00.000Z');
  assert.equal(slot('2026-03-08'), '2026-03-08T14:00:00.000Z');
  assert.equal(
    slot('2026-11-03', { cadence: '35 19 * * *' }),
    '2026-11-03T03:35:00.000Z',
  );
});

void test('midnight is inclusive and the next UTC midnight is excluded', () => {
  assert.equal(
    slot('2026-11-03', { cadence: '0 0 * * *', timezone: 'UTC' }),
    '2026-11-03T00:00:00.000Z',
  );
  assert.equal(
    slot('2026-11-03', { cadence: '0 9 * * *', timezone: 'Asia/Tokyo' }),
    '2026-11-03T00:00:00.000Z',
  );
  // LA 16:30 moves from 23:30 UTC to 00:30 UTC on the next day.
  assert.equal(slot('2026-11-01', { cadence: '30 16 * * *' }), null);
  assert.equal(
    slot('2026-11-02', { cadence: '30 16 * * *' }),
    '2026-11-02T00:30:00.000Z',
  );
});

void test('DST nonexistent times shift forward and repeated times select the first occurrence', () => {
  assert.equal(
    slot('2026-03-08', { cadence: '30 2 * * *' }),
    '2026-03-08T10:30:00.000Z',
  );
  assert.equal(
    slot('2026-11-01', { cadence: '30 1 * * *' }),
    '2026-11-01T08:30:00.000Z',
  );
});

void test('invalid dates and unsupported schedules fail closed', () => {
  for (const day of ['2026-02-30', '2026-13-01', 'invalid', '2026-1-01'])
    assert.throws(() => slot(day), /Invalid UTC budget day/);
  for (const changes of [{ cadence: '* * * * *' }, { timezone: 'bad-zone' }])
    assert.throws(() => slot('2026-11-03', changes));
});

void test('budget slots agree with the actual BullMQ repeat strategy for timezone and DST cases', async () => {
  const { defaultRepeatStrategy } = await import('bullmq');
  for (const day of [
    '2026-03-07',
    '2026-03-08',
    '2026-11-01',
    '2026-11-02',
    '2026-11-03',
  ]) {
    for (const timezone of [
      'UTC',
      'America/Los_Angeles',
      'Asia/Tokyo',
      'Pacific/Auckland',
    ]) {
      for (const cadence of [
        '0 0 * * *',
        '30 1 * * *',
        '30 2 * * *',
        '0 7 * * *',
        '30 16 * * *',
      ]) {
        const midnight = Date.parse(`${day}T00:00:00Z`);
        const expected = defaultRepeatStrategy(midnight - 1, {
          pattern: cadence,
          tz: timezone,
        });
        assert.ok(expected);
        assert.equal(
          budgetDaySlot(day, { ...schedule, cadence, timezone })?.getTime() ??
            null,
          expected < midnight + 86400000 ? expected : null,
          `${day} ${timezone} ${cadence}`,
        );
      }
    }
  }
});
