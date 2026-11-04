import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import {
  backgroundTriage,
  incrementalTriageServices,
} from '../src/modules/curation/public/incremental-triage';
import {
  scheduledLedgerContext,
  withEditionRun,
  withScheduledAttempt,
} from '../src/modules/curation/public/scheduled-context';

void test('incremental triage defaults off before accessing database or credentials and requires reserve protection', () => {
  const db = new Proxy({} as Pool, {
    get() {
      throw new Error('DB accessed');
    },
  });
  assert.equal(incrementalTriageServices(db, {}), null);
  assert.equal(
    incrementalTriageServices(db, { LLM_INCREMENTAL_TRIAGE_ENABLED: '0' }),
    null,
  );
  assert.throws(
    () =>
      incrementalTriageServices(db, { LLM_INCREMENTAL_TRIAGE_ENABLED: 'true' }),
    /Invalid/,
  );
  assert.throws(
    () =>
      incrementalTriageServices(db, { LLM_INCREMENTAL_TRIAGE_ENABLED: '1' }),
    /requires/,
  );
  assert.equal(
    incrementalTriageServices(db, {
      LLM_INCREMENTAL_TRIAGE_ENABLED: '1',
      LLM_SCHEDULED_RESERVE_ENABLED: '1',
    }),
    null,
  );
});

void test('background triage clears inherited scheduled context across async work and restores its caller', async () => {
  const triage = backgroundTriage({
    async score(_topic, candidates) {
      await Promise.resolve();
      assert.equal(scheduledLedgerContext(), undefined);
      return { scores: [], unscoredIds: candidates.map((c) => c.id) };
    },
  });
  await withScheduledAttempt('slot', 1, () =>
    withEditionRun('slot', 'edition', async () => {
      assert.ok(scheduledLedgerContext());
      const result = await triage.score(
        { id: 'topic', name: 'Topic', description: '', guidance: '' },
        [],
        'edition',
      );
      assert.deepEqual(result, { scores: [], unscoredIds: [] });
      assert.equal(scheduledLedgerContext()?.editionRunId, 'edition');
    }),
  );
  assert.equal(scheduledLedgerContext(), undefined);
});
