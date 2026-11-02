import assert from 'node:assert/strict';
import { test } from 'node:test';

import { scheduledReserveConfig } from '../src/modules/curation/adapters/config';

void test('reserve configuration defaults off with conservative automatic sizing', () => {
  assert.deepEqual(scheduledReserveConfig({}), {
    enabled: false,
    policy: { headroom: 1.5, configuredMicros: undefined },
  });
  assert.deepEqual(
    scheduledReserveConfig({
      LLM_SCHEDULED_RESERVE_ENABLED: '1',
      LLM_SCHEDULED_RESERVE_HEADROOM: '2',
      LLM_SCHEDULED_RESERVE_MICROS: '0',
    }),
    { enabled: true, policy: { headroom: 2, configuredMicros: 0 } },
  );
});

void test('reserve configuration rejects malformed deployment values even while disabled', () => {
  for (const value of ['', 'true', 'yes', '2'])
    assert.throws(() =>
      scheduledReserveConfig({ LLM_SCHEDULED_RESERVE_ENABLED: value }),
    );
  for (const value of ['', '0.9', '-1', 'NaN', 'Infinity'])
    assert.throws(() =>
      scheduledReserveConfig({ LLM_SCHEDULED_RESERVE_HEADROOM: value }),
    );
  for (const value of ['', ' ', '-1', '1.5', '1e6', 'NaN', '9007199254740992'])
    assert.throws(() =>
      scheduledReserveConfig({ LLM_SCHEDULED_RESERVE_MICROS: value }),
    );
});
