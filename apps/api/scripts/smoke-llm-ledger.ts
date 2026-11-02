// Explicit isolated Postgres check. Does not read DATABASE_URL or live data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

import { Pool } from 'pg';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { readUsage } from '../src/modules/curation/database/usage.reader';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

async function smoke() {
  const id = execFileSync(
    'docker',
    [
      'run',
      '--rm',
      '-d',
      '-e',
      'POSTGRES_HOST_AUTH_METHOD=trust',
      '-p',
      '127.0.0.1::5432',
      'postgres:17-alpine',
    ],
    { encoding: 'utf8' },
  ).trim();
  let db: Pool | undefined;
  try {
    const binding = execFileSync('docker', ['port', id, '5432/tcp'], {
      encoding: 'utf8',
    }).trim();
    const port = Number(binding.split(':').at(-1));
    assert.ok(port > 0);
    db = new Pool({
      host: '127.0.0.1',
      port,
      user: 'postgres',
      database: 'postgres',
      connectionTimeoutMillis: 1000,
    });
    for (let i = 0; ; i++) {
      try {
        await db.query('SELECT 1');
        break;
      } catch (error) {
        if (i > 100) throw error;
        await setTimeout(100);
      }
    }
    await db.query(await readFile('migrations/015_llm_ledger.sql', 'utf8'));
    const config = llmConfig({});
    const request: LlmRequest = {
      model: config.haiku,
      purpose: 'isolated-ledger-smoke',
      runId: 'fixture',
      instructions: '',
      prompt: '',
      maxOutputTokens: 10,
    };
    const ledger = new PostgresLlmLedger(db, {
      monthly: 100000,
      dailyMax: 100000,
    });
    // 60% of any day's allowance; serialization must admit exactly one caller.
    const clock = (
      await db.query<{ day: Date }>(
        "SELECT date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS day",
      )
    ).rows[0].day;
    const days =
      new Date(
        Date.UTC(clock.getUTCFullYear(), clock.getUTCMonth() + 1, 0),
      ).getUTCDate() -
      clock.getUTCDate() +
      1;
    const estimate = Math.ceil(Math.floor(100000 / days) * 0.6);
    const reservations = await Promise.all(
      Array.from({ length: 10 }, () => ledger.reserve(request, estimate)),
    );
    assert.equal(reservations.filter(Boolean).length, 1);
    const call = reservations.find((n) => n !== null)!;
    await ledger.settle(
      call,
      { input: 10, cacheWrite: 20, cacheRead: 30, output: 40 },
      50,
    );
    const row = (await db.query('SELECT * FROM llm_calls WHERE id=$1', [call]))
      .rows[0];
    assert.equal(row.cost_micros, '50');
    assert.equal(row.cache_write_tokens, 20);
    const settledUsage = await readUsage(db, ledger.caps);
    assert.equal(settledUsage.todayMicros, 50);
    assert.equal(settledUsage.monthMicros, 50);
    assert.equal(settledUsage.todayReservedMicros, 0);
    assert.equal(settledUsage.models[0].calls, 1);
    await ledger.cache('fixture', { ok: true });
    await ledger.cache('fixture', { ok: false });
    assert.deepEqual(await ledger.cached('fixture'), { ok: true });
    assert.equal(await ledger.cached('absent'), undefined);
    const second = await ledger.reserve(request, estimate);
    assert.ok(second);
    await ledger.fail(second, 'provider-spend-limit', true, false);
    assert.equal(await ledger.reserve(request, 1), null);
    const blockedUsage = await readUsage(db, ledger.caps);
    assert.ok(blockedUsage.blockedUntil);
    assert.equal(blockedUsage.lastError?.code, 'provider-spend-limit');
    assert.equal(blockedUsage.availableMicros, 0);
    // Last month's block expires, while uncertain prior calls stay charged.
    await db.query(
      "UPDATE llm_provider_blocks SET month_start=(date_trunc('month',now()) - interval '1 month')::date",
    );
    assert.ok(await ledger.reserve(request, 1));
    await db.query(
      "UPDATE llm_calls SET status='uncertain',cost_micros=NULL,created_at=now()-interval '2 months',reserved_micros=1000000",
    );
    assert.equal(await ledger.reserve(request, 1), null);
    const uncertainUsage = await readUsage(db, ledger.caps);
    assert.equal(uncertainUsage.availableMicros, 0);
    assert.ok(uncertainUsage.monthReservedMicros >= 1000000);
    console.log(
      'Isolated Postgres ledger: concurrent reservations, settlement, cache, provider block/rollover and retained uncertainty passed',
    );
  } finally {
    await db?.end();
    execFileSync('docker', ['rm', '-f', id], { stdio: 'ignore' });
  }
}
void smoke().catch(() => {
  console.error('Isolated ledger smoke failed');
  process.exitCode = 1;
});
