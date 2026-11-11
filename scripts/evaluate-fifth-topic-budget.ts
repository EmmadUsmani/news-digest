// Read-only estimate from saved editions; no inference or admission changes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { database } from '../apps/api/src/libs/db/connections';
import {
  llmConfig,
  scheduledReserveConfig,
} from '../apps/api/src/modules/curation/adapters/config';
import { readFullAiEditionCosts } from '../apps/api/src/modules/curation/database/edition-cost.reader';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--read-only']);
  const env = parseEnv(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  const config = llmConfig(env);
  const reserve = scheduledReserveConfig(env);
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-us-scope-2026-11-04-10.json',
      'utf8',
    ),
  ) as { windows: { date: string; editionId: string }[] };
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '15s'");
    const measurements = [];
    for (const window of fixture.windows) {
      const {
        rows: [row],
      } = await client.query<{
        cost: number;
        unresolved: number;
        topics: number;
      }>(
        `SELECT
        (SELECT coalesce(sum(cost_micros),0)::float8 FROM llm_calls WHERE run_id=d.id::text) AS cost,
        (SELECT count(*)::int FROM llm_calls WHERE run_id=d.id::text AND status IN ('pending','uncertain')) AS unresolved,
        jsonb_array_length(snapshot->'topics') AS topics
        FROM digest_previews d WHERE id=$1`,
        [window.editionId],
      );
      assert.ok(
        row && row.cost > 0 && row.topics === 4 && row.unresolved === 0,
      );
      measurements.push({
        date: window.date,
        costMicros: row.cost,
        fifthTopicProxyMicros: Math.ceil(row.cost / row.topics),
      });
    }
    const complete = await readFullAiEditionCosts(client, new Date());
    assert.ok(complete.length > 0);
    const projected = Math.max(
      ...measurements.map((row) => row.costMicros + row.fifthTopicProxyMicros),
      ...complete.map((cost) => Math.ceil((cost * 5) / 4)),
    );
    console.log(
      JSON.stringify(
        {
          measurements,
          recentCompleteEditionCostsMicros: complete,
          projectedFiveTopicMicros: projected,
          reserveAt1_5Micros: Math.ceil(projected * 1.5),
          configuredDailyMaxMicros: config.caps.dailyMax,
          configuredReserve: reserve,
          ownerDailyCeilingMicros: 650000,
          fitsOwnerCeiling: Math.ceil(projected * 1.5) <= 650000,
          note: 'Equal-share fifth-topic proxy, not measured World attribution: llm_calls has no topic ID. Includes all saved-run costs, including repairs. Does not bound new candidate volume, joint prompt size or monthly/model admission. No cap change justified solely by this proxy.',
        },
        null,
        2,
      ),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(() => {
  console.error('Read-only fifth-topic cost evaluation failed');
  process.exitCode = 1;
});
