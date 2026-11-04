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

void test('lost admission session releases its lock and stale cleanup cannot unlock a successor', async () => {
  const firstDb = database();
  const secondDb = database();
  const first = new PostgresIncrementalTriageAdmission(firstDb);
  const second = new PostgresIncrementalTriageAdmission(secondDb);
  // Observe only this dedicated pool's backend; never terminate by lock ID or
  // application name, which could affect another test or a live worker.
  let backend = 0;
  let disconnected!: () => void;
  const lost = new Promise<void>((resolve) => {
    disconnected = resolve;
  });
  firstDb.once('connect', (client) => {
    client.once('error', disconnected);
    client.once('end', disconnected);
  });
  try {
    const client = await firstDb.connect();
    backend = (
      await client.query<{ pid: number }>('SELECT pg_backend_pid() AS pid')
    ).rows[0].pid;
    client.release();
    const staleRelease = await first.acquire();
    assert.ok(staleRelease);
    assert.equal(await second.acquire(), null);
    const terminated = await secondDb.query<{ terminated: boolean }>(
      'SELECT pg_terminate_backend($1) AS terminated',
      [backend],
    );
    assert.equal(terminated.rows[0].terminated, true);
    await lost;
    const successorRelease = await second.acquire();
    assert.ok(successorRelease, 'Postgres must release a dead session lock');
    try {
      await assert.rejects(staleRelease());
      await staleRelease();
      assert.equal(
        await first.acquire(),
        null,
        'stale cleanup must not unlock the successor',
      );
    } finally {
      await successorRelease();
    }
    const recovered = await first.acquire();
    assert.ok(recovered, 'the failed pool client must be replaced');
    await recovered();
  } finally {
    await Promise.all([firstDb.end(), secondDb.end()]);
  }
});
