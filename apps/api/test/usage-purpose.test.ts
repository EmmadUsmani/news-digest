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

void test('usage snapshots pin UTC boundaries, model holds, errors and monthly provider blocks', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  await db.query('BEGIN');
  try {
    await db.query('DELETE FROM llm_calls');
    await db.query('DELETE FROM llm_provider_blocks');
    const now = new Date('2026-11-02T00:00:00Z');
    const caps = {
      monthly: 30000,
      dailyMax: 1000,
      modelAllocation: { model: 'fixture', dailyFraction: 0.5 },
    };
    const empty = await readUsage(db, caps, now);
    assert.equal(empty.availableMicros, 1000);
    assert.equal(empty.lastError, null);
    assert.deepEqual(empty.models, []);
    assert.deepEqual(empty.purposes, []);
    assert.deepEqual(empty.modelAllocation, {
      model: 'fixture',
      dailyCapMicros: 500,
      usedMicros: 0,
      availableMicros: 500,
    });
    for (const [model, at, status, reserved, cost, error] of [
      ['fixture', '2026-10-31T23:59:59.999Z', 'succeeded', 900, 900, null],
      ['fixture', '2026-11-01T00:00:00Z', 'succeeded', 100, 100, null],
      ['fixture', '2026-11-01T23:59:59.999Z', 'succeeded', 50, 50, null],
      ['fixture', '2026-11-02T01:00:00+01:00', 'succeeded', 40, 40, null],
      ['fixture', '2026-09-01T00:00:00Z', 'uncertain', 30, null, 'old-error'],
      ['fixture', '2026-11-02T00:00:00Z', 'pending', 20, null, null],
      ['fixture', '2026-11-02T00:00:00Z', 'failed', 700, null, 'latest-error'],
      ['other', '2026-11-02T00:00:00Z', 'succeeded', 10, 10, null],
    ] as const) {
      await db.query(
        `INSERT INTO llm_calls
        (id,model,purpose,run_id,created_at,completed_at,status,reserved_micros,cost_micros,error_code)
        VALUES($1,$2,'fixture','offline',$3,$3,$4,$5,$6,$7)`,
        [randomUUID(), model, at, status, reserved, cost, error],
      );
    }
    const usage = await readUsage(db, caps, now);
    assert.equal(usage.monthMicros, 200);
    assert.equal(usage.todayMicros, 50);
    assert.equal(usage.monthReservedMicros, 50);
    assert.equal(usage.todayReservedMicros, 50);
    assert.equal(usage.availableMicros, 900);
    assert.deepEqual(usage.models, [
      { model: 'fixture', calls: 5, costMicros: 190 },
      { model: 'other', calls: 1, costMicros: 10 },
    ]);
    assert.deepEqual(usage.modelAllocation, {
      model: 'fixture',
      dailyCapMicros: 500,
      usedMicros: 90,
      availableMicros: 410,
    });
    assert.deepEqual(usage.lastError, {
      code: 'latest-error',
      at: now.toISOString(),
    });
    await db.query(`INSERT INTO llm_provider_blocks(month_start,error_code)
      VALUES('2026-10-01','previous-month')`);
    assert.equal((await readUsage(db, caps, now)).blockedUntil, null);
    await db.query(`INSERT INTO llm_provider_blocks(month_start,error_code)
      VALUES('2026-11-01','current-month')`);
    const blocked = await readUsage(db, caps, now);
    assert.equal(blocked.availableMicros, 0);
    assert.equal(blocked.modelAllocation?.availableMicros, 0);
    assert.equal(blocked.blockedUntil, '2026-12-01T00:00:00.000Z');
    assert.equal(blocked.todayMicros, usage.todayMicros);
    assert.equal(blocked.modelAllocation?.usedMicros, 90);
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
});
