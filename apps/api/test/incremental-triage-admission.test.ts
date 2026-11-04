import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import {
  backgroundTriage,
  evidencedBackgroundTriage,
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
  assert.throws(
    () =>
      incrementalTriageServices(db, {
        LLM_INCREMENTAL_TRIAGE_ENABLED: '1',
        LLM_SCHEDULED_RESERVE_ENABLED: '1',
        ANTHROPIC_API_KEY: 'fake-not-used',
      }),
    /absolute evidence directory/,
  );
  for (const key of [undefined, '', '   '])
    assert.throws(
      () =>
        incrementalTriageServices(db, {
          LLM_INCREMENTAL_TRIAGE_ENABLED: '1',
          LLM_SCHEDULED_RESERVE_ENABLED: '1',
          ANTHROPIC_API_KEY: key,
        }),
      /^Error: Incremental triage requires ANTHROPIC_API_KEY$/,
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

void test('background scoring exports isolated successful writes and exposes partial and export failures', async () => {
  const exports: { topicId: string; attemptId: string; articleId: string }[][] =
    [];
  const cache = {
    cached: () => Promise.resolve(null),
    cache: () => Promise.resolve(),
  };
  let exportFails = false;
  const scoringError = new Error('scoring failed');
  const exportError = new Error('export failed');
  const scorer = evidencedBackgroundTriage(
    cache,
    (observed) => ({
      async score(topic) {
        assert.equal(scheduledLedgerContext(), undefined);
        await observed.cache('triage-item-v1:' + 'a'.repeat(64), {
          id: topic.id,
        });
        if (topic.id === 'partial') throw scoringError;
        return { scores: [], unscoredIds: [] };
      },
    }),
    async (rows) => {
      if (exportFails) throw exportError;
      exports.push(rows);
    },
  );
  const score = (id: string) =>
    scorer.score(
      { id, name: id, description: '', guidance: '' },
      [],
      'shared-run',
    );
  await withScheduledAttempt('slot', 1, () =>
    Promise.all([score('one'), score('two')]),
  );
  assert.deepEqual(
    exports.map((rows) => rows.map((row) => row.articleId)).sort(),
    [['one'], ['two']],
  );
  assert.notEqual(exports[0][0].attemptId, exports[1][0].attemptId);
  await assert.rejects(score('partial'), (error) => error === scoringError);
  assert.equal(exports[2][0].articleId, 'partial');
  exportFails = true;
  await assert.rejects(score('one'), (error) => error === exportError);
  await assert.rejects(score('partial'), (error) => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(error.errors, [scoringError, exportError]);
    return true;
  });
});
