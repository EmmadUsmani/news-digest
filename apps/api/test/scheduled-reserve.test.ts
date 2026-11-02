import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  scheduledReserveAllowance,
  type ScheduledReserveInput,
} from '../src/modules/curation/domain/scheduled-reserve';

const baseline: ScheduledReserveInput = {
  dailyCap: 480000,
  available: 460000,
  todayUsed: 20000,
  recentFullAiEditionCosts: [100000, 120001, 80000],
  state: 'pending',
  scheduledRun: false,
};
const policy = { headroom: 1.5 };

void test('reserve sizes from largest full AI cost with rounded-up headroom', () => {
  assert.deepEqual(scheduledReserveAllowance(baseline, policy), {
    sizedReserveMicros: 180002,
    reserveMicros: 180002,
    otherSpendLimitMicros: 299998,
    otherAvailableMicros: 279998,
    availableMicros: 279998,
    limitedByReserve: true,
  });
  assert.equal(
    scheduledReserveAllowance(
      { ...baseline, recentFullAiEditionCosts: [400000] },
      policy,
    ).reserveMicros,
    480000,
  );
});

void test('unknown or cache-only cost protects full day; explicit override is bounded', () => {
  for (const costs of [[], [0, 0]]) {
    const allowance = scheduledReserveAllowance(
      { ...baseline, recentFullAiEditionCosts: costs },
      policy,
    );
    assert.equal(allowance.reserveMicros, baseline.dailyCap);
    assert.equal(allowance.availableMicros, 0);
  }
  for (const configuredMicros of [0, 100000, 900000]) {
    assert.equal(
      scheduledReserveAllowance(baseline, { ...policy, configuredMicros })
        .reserveMicros,
      Math.min(configuredMicros, baseline.dailyCap),
    );
  }
});

void test('scheduled work keeps ordinary allowance; running and retrying never release protection', () => {
  for (const state of ['pending', 'running', 'retrying'] as const) {
    const other = scheduledReserveAllowance({ ...baseline, state }, policy);
    const scheduled = scheduledReserveAllowance(
      { ...baseline, state, scheduledRun: true },
      policy,
    );
    assert.equal(other.reserveMicros, 180002);
    assert.equal(scheduled.availableMicros, baseline.available);
    assert.equal(scheduled.limitedByReserve, false);
  }
  for (const state of ['succeeded', 'failed'] as const) {
    const released = scheduledReserveAllowance({ ...baseline, state }, policy);
    assert.equal(released.reserveMicros, 0);
    assert.equal(released.availableMicros, baseline.available);
    assert.equal(released.limitedByReserve, false);
  }
});

void test('reserve cannot bypass monthly exhaustion or restore spent funds', () => {
  assert.equal(
    scheduledReserveAllowance({ ...baseline, available: 5 }, policy)
      .availableMicros,
    5,
  );
  assert.equal(
    scheduledReserveAllowance(
      { ...baseline, todayUsed: 400000, available: 80000 },
      policy,
    ).availableMicros,
    0,
  );
  for (const scheduledRun of [false, true]) {
    assert.equal(
      scheduledReserveAllowance(
        { ...baseline, dailyCap: 0, available: 0, scheduledRun },
        policy,
      ).availableMicros,
      0,
    );
  }
});

void test('reserve rejects invalid monetary inputs and headroom', () => {
  for (const invalid of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    for (const key of ['dailyCap', 'available', 'todayUsed'] as const) {
      assert.throws(() =>
        scheduledReserveAllowance({ ...baseline, [key]: invalid }, policy),
      );
    }
    assert.throws(() =>
      scheduledReserveAllowance(
        { ...baseline, recentFullAiEditionCosts: [invalid] },
        policy,
      ),
    );
    assert.throws(() =>
      scheduledReserveAllowance(baseline, {
        ...policy,
        configuredMicros: invalid,
      }),
    );
  }
  for (const headroom of [0, 0.99, NaN, Infinity]) {
    assert.throws(() => scheduledReserveAllowance(baseline, { headroom }));
  }
});
