import assert from 'node:assert/strict';
import { test } from 'node:test';

import { scheduledSlot } from '../src/modules/profiles/domain/scheduled-slot';

void test('outage recovery keeps slots through six hours, skips older runs and rejects invalid or future times', () => {
  const now = Date.parse('2026-11-01T12:00:00Z');
  for (const lateness of [0, 60000, 6 * 3600000]) {
    const timestamp = now - lateness;
    assert.deepEqual(scheduledSlot(timestamp, now), {
      ok: true,
      value: { timestamp },
    });
  }
  for (const lateness of [6 * 3600000 + 1, 24 * 3600000, 7 * 86400000]) {
    const result = scheduledSlot(now - lateness, now);
    assert.ok(result.ok);
    assert.match(result.value.skip!, /more than six hours late/);
    assert.equal(result.value.timestamp, now - lateness);
  }
  for (const timestamp of [
    undefined,
    NaN,
    Infinity,
    now + 1,
    now + 0.5,
    Number.MAX_SAFE_INTEGER,
  ])
    assert.equal(scheduledSlot(timestamp, now).ok, false);
  assert.equal(scheduledSlot(now, NaN).ok, false);
});
