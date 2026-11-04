import assert from 'node:assert/strict';
import { test } from 'node:test';

import { arrivalWindow } from '../../../scripts/export-triage-arrivals';

void test('arrival export requires a bounded completed window before database access', () => {
  const now = Date.parse('2026-11-04T00:00:00Z');
  assert.deepEqual(
    arrivalWindow(['2026-11-02', '2026-11-03', '/tmp/arrivals'], now),
    {
      start: '2026-11-02T00:00:00.000Z',
      end: '2026-11-03T00:00:00.000Z',
      directory: '/tmp/arrivals',
    },
  );
  for (const args of [
    [],
    ['bad', '2026-11-03', '/tmp/a'],
    ['2026-11-03', '2026-11-02', '/tmp/a'],
    ['2026-11-01', '2026-11-04', '/tmp/a'],
    ['2026-11-03', '2026-11-05', '/tmp/a'],
  ])
    assert.throws(() => arrivalWindow(args, now), /completed window/);
});
