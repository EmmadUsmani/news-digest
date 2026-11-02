import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';

import { Pool } from 'pg';

import { readUsage } from '../src/modules/curation/database/usage.reader';

void test('purpose totals reconcile spend and retain old holds without counting failed reservations', async () => {
  const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  await db.query('BEGIN');
  try {
    await db.query('DELETE FROM llm_calls');
    for (const [purpose, age, status, reserved, cost] of [
      ['verification', '0 days', 'succeeded', 100, 20],
      ['verification', '2 months', 'uncertain', 30, null],
      ['verification', '0 days', 'failed', 70, null],
      ['shortlist-editor-v4', '0 days', 'succeeded', 200, 90],
      ['shortlist-editor-v4', '0 days', 'pending', 40, null],
      ['expired', '2 months', 'succeeded', 500, 400],
    ] as const) {
      await db.query(
        `INSERT INTO llm_calls(id,model,purpose,run_id,created_at,status,reserved_micros,cost_micros)
         VALUES($1,'fixture',$2,'offline',date_trunc('day',now())-$3::interval,$4,$5,$6)`,
        [randomUUID(), purpose, age, status, reserved, cost],
      );
    }
    const usage = await readUsage(db, { monthly: 30e6, dailyMax: 1e6 });
    assert.deepEqual(usage.purposes, [
      {
        purpose: 'shortlist-editor-v4',
        todayMicros: 90,
        monthMicros: 90,
        reservedMicros: 40,
      },
      {
        purpose: 'verification',
        todayMicros: 20,
        monthMicros: 20,
        reservedMicros: 30,
      },
    ]);
    assert.equal(
      usage.purposes.reduce((sum, row) => sum + row.todayMicros, 0),
      usage.todayMicros,
    );
    assert.equal(
      usage.purposes.reduce((sum, row) => sum + row.monthMicros, 0),
      usage.monthMicros,
    );
    assert.equal(
      usage.purposes.reduce((sum, row) => sum + row.reservedMicros, 0),
      usage.todayReservedMicros,
    );
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
});
