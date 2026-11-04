import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { IncrementalTriageRunner } from '../src/modules/curation/application/incremental-triage-runner';
import { PostgresIncrementalTriageAdmission } from '../src/modules/curation/database/incremental-triage-admission';

void test('independent workers skip locked pools and release admission after loader failure', async () => {
  const firstDb = database();
  const secondDb = database();
  const first = new PostgresIncrementalTriageAdmission(firstDb);
  const second = new PostgresIncrementalTriageAdmission(secondDb);
  try {
    const release = await first.acquire();
    assert.ok(release);
    assert.equal(await second.acquire(), null);
    await release();
    await release(); // Idempotent release cannot unlock another pass.
    const next = await second.acquire();
    assert.ok(next);
    await next();
    const runner = new IncrementalTriageRunner(
      {
        pending: async () => {
          throw new Error('unexpected cache read');
        },
        score: async () => {
          throw new Error('unexpected provider call');
        },
      },
      () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
      () => 0,
      first,
    );
    const options = { minimumPending: 1, maximumItems: 25 };
    const held = await second.acquire();
    assert.ok(held);
    assert.deepEqual(
      await runner.run(async () => {
        throw new Error('must not load busy pool');
      }, options),
      { status: 'busy' },
    );
    await held();
    await assert.rejects(
      runner.run(async () => {
        throw new Error('loader failure');
      }, options),
      /loader failure/,
    );
    const recovered = await second.acquire();
    assert.ok(recovered);
    await recovered();
  } finally {
    await Promise.all([firstDb.end(), secondDb.end()]);
  }
});
