import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  scheduledLedgerContext,
  withEditionRun,
  withScheduledAttempt,
} from '../src/modules/curation/public/scheduled-context';

void test('scheduled claims and edition bindings remain isolated across overlapping async work', async () => {
  let release!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const old = withScheduledAttempt('slot', 1, () =>
    withEditionRun('slot', 'old-edition', async () => {
      await barrier;
      assert.deepEqual(scheduledLedgerContext(), {
        runId: 'slot',
        attempt: 1,
        editionRunId: 'old-edition',
      });
    }),
  );
  await withScheduledAttempt('slot', 2, async () => {
    assert.equal(scheduledLedgerContext(), undefined);
    await withEditionRun('slot', 'new-edition', async () => {
      await Promise.resolve();
      assert.deepEqual(scheduledLedgerContext(), {
        runId: 'slot',
        attempt: 2,
        editionRunId: 'new-edition',
      });
      for (const key of [undefined, 'other-slot']) {
        await withEditionRun(key, 'manual-edition', async () => {
          await Promise.resolve();
          assert.equal(scheduledLedgerContext(), undefined);
        });
        assert.equal(scheduledLedgerContext()?.editionRunId, 'new-edition');
      }
    });
  });
  release();
  await old;
  assert.equal(scheduledLedgerContext(), undefined);
});

void test('manual generations and failed callbacks cannot retain scheduled privileges', async () => {
  await withEditionRun('slot', 'unclaimed-edition', async () => {
    assert.equal(scheduledLedgerContext(), undefined);
  });
  await assert.rejects(
    withScheduledAttempt('slot', 1, () =>
      withEditionRun('slot', 'failed-edition', async () => {
        throw new Error('fixture failure');
      }),
    ),
    /fixture failure/,
  );
  assert.equal(scheduledLedgerContext(), undefined);
});
