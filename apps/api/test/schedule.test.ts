import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  coverageWindow,
  durationMilliseconds,
  validateSchedule,
} from '../src/modules/profiles/domain/schedule';
const config = {
  cadence: '0 8 * * *',
  timezone: 'America/Los_Angeles',
  coverageWindow: 'P1D',
  storyBudget: 5,
  postBudget: 5,
};
test('schedule validates timezone, supported daily cadence and bounded budgets', () => {
  assert.equal(validateSchedule(config).ok, true);
  for (const override of [
    { timezone: 'Mars/Olympus' },
    { cadence: '60 8 * * *' },
    { cadence: '0 24 * * *' },
    { cadence: '* * * * *' },
    { storyBudget: -1 },
    { postBudget: 21 },
    { storyBudget: 1.5 },
    { coverageWindow: 'P1M' },
  ])
    assert.equal(validateSchedule({ ...config, ...override }).ok, false);
  assert.equal(
    validateSchedule({ ...config, storyBudget: 0, postBudget: 20 }).ok,
    true,
  );
});
test('duration supports arbitrary elapsed coverage without calendar ambiguity', () => {
  for (const [duration, hours] of [
    ['PT6H', 6],
    ['P7D', 168],
    ['P1DT2H30M', 26.5],
    ['PT30M', 0.5],
  ] as const)
    assert.equal(durationMilliseconds(duration), hours * 3600000);
  for (const invalid of [
    'P',
    'PT',
    'P0D',
    'P1M',
    'P1Y',
    '-P1D',
    'P1DT',
    'garbage',
    'P999999999999999D',
  ])
    assert.equal(durationMilliseconds(invalid), null);
});
test('half-open coverage windows remain exact across DST, leap day and year boundaries', () => {
  for (const timestamp of [
    '2026-03-08T10:30:00Z',
    '2026-11-01T09:30:00Z',
    '2024-03-01T00:00:00Z',
    '2027-01-01T00:00:00Z',
  ]) {
    const end = new Date(timestamp);
    const result = coverageWindow(end, 'P1D');
    assert.equal(result.ok, true);
    if (!result.ok) throw new Error(result.error);
    assert.equal(
      result.value.windowEnd.getTime() - result.value.windowStart.getTime(),
      86400000,
    );
    assert.equal(result.value.windowEnd.toISOString(), end.toISOString());
    end.setTime(0);
    assert.notEqual(result.value.windowEnd.getTime(), 0);
  }
  assert.equal(coverageWindow(new Date('invalid'), 'P1D').ok, false);
  assert.equal(coverageWindow(new Date(), 'PT0S').ok, false);
});
