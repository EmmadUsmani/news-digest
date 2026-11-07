import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developmentSpendAllowance as allowance } from '../src/modules/digests/domain/development-spend';

void test('development pools stop at 75% of owner lifetime budgets independently', () => {
  assert.deepEqual(allowance('anthropic', 5_000_000, 0), {
    capMicros: 5_000_000,
    stopAtMicros: 3_750_000,
    availableMicros: 3_750_000,
    mustReport: false,
  });
  assert.equal(allowance('xai', 2_000_000, 0).availableMicros, 1_500_000);
  for (const [provider, cap, stop] of [
    ['anthropic', 5_000_000, 3_750_000],
    ['xai', 2_000_000, 1_500_000],
  ] as const) {
    assert.equal(allowance(provider, cap, stop - 1).availableMicros, 1);
    assert.equal(allowance(provider, cap, stop - 1).mustReport, false);
    for (const spent of [stop, stop + 1, cap, cap + 1]) {
      assert.equal(allowance(provider, cap, spent).availableMicros, 0);
      assert.equal(allowance(provider, cap, spent).mustReport, true);
    }
  }
});

void test('pending and uncertain reservations consume lifetime allowance', () => {
  const settled = 1_000_000;
  const pending = 400_000;
  const uncertain = 100_000;
  assert.equal(allowance('xai', 2_000_000, settled).availableMicros, 500_000);
  assert.equal(
    allowance('xai', 2_000_000, settled + pending + uncertain).mustReport,
    true,
  );
});

void test('lower pool caps and disabled pools cannot bypass the report threshold', () => {
  assert.equal(allowance('anthropic', 1_000_000, 750_000).mustReport, true);
  assert.equal(allowance('xai', 0, 0).availableMicros, 0);
  assert.equal(allowance('xai', 0, 0).mustReport, true);
  assert.equal(allowance('xai', 3, 0).availableMicros, 2);
  assert.equal(allowance('xai', 3, 2).mustReport, true);
});

void test('database cap edits cannot exceed code ceilings; invalid amounts fail closed', () => {
  assert.throws(() => allowance('anthropic', 5_000_001, 0));
  assert.throws(() => allowance('xai', 2_000_001, 0));
  for (const invalid of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => allowance('xai', invalid, 0));
    assert.throws(() => allowance('xai', 2_000_000, invalid));
  }
  assert.throws(() => allowance('unknown' as 'xai', 1, 0));
});
