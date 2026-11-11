// Read-only estimate from saved editions; no inference or admission changes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { database } from '../apps/api/src/libs/db/connections';
import {
  llmConfig,
  scheduledReserveConfig,
} from '../apps/api/src/modules/curation/adapters/config';
import {
  readEditionCost,
  readFullAiEditionCosts,
} from '../apps/api/src/modules/curation/database/edition-cost.reader';
import { readUsage } from '../apps/api/src/modules/curation/database/usage.reader';
import {
  budgetAllowance,
  utcBudgetPeriod,
} from '../apps/api/src/modules/curation/domain/budget';
import { scheduledReserveAllowance } from '../apps/api/src/modules/curation/domain/scheduled-reserve';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--read-only']);
  const env = parseEnv(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  const config = llmConfig(env);
  const reserve = scheduledReserveConfig(env);
  const headroom = reserve.policy.headroom ?? 1.5;
  assert.ok(Number.isFinite(headroom) && headroom >= 1);
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-us-scope-2026-11-04-10.json',
      'utf8',
    ),
  ) as { windows: { date: string; editionId: string }[] };
  // Settlement logs carry topic IDs that the ledger does not. Never join by
  // timestamp: concurrent manual runs can overlap the scheduled edition.
  const settlements = execFileSync(
    'journalctl',
    [
      '--user',
      '-u',
      'news-digest-worker.service',
      '--since',
      '2026-11-04 UTC',
      '--until',
      '2026-11-11 UTC',
      '--grep',
      'budget.settlement',
      '-o',
      'cat',
      '--no-pager',
    ],
    { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
  )
    .split('\n')
    .filter(Boolean)
    .map(
      (line) =>
        JSON.parse(line) as {
          event: string;
          runId: string;
          purpose: string;
          topicId?: string;
          costMicros: number;
        },
    )
    .filter((row) => row.event === 'budget.settlement');
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
      const ledger = await readEditionCost(client, window.editionId);
      assert.equal(ledger.costMicros, row.cost);
      assert.equal(ledger.reservedMicros, 0);
      assert.ok(
        ledger.byModelAndPurpose.every((part) => part.unresolved === 0),
      );
      const grouping = ledger.byModelAndPurpose
        .filter((part) => part.purpose === 'story-grouping-v3')
        .reduce((sum, part) => sum + part.costMicros, 0);
      // Deliberately over-credit savings: even removing ALL four topics'
      // grouping for free cannot establish an achievable two-topic saving.
      const optimisticFiveTopic =
        row.cost + Math.ceil(row.cost / row.topics) - grouping;
      assert.ok(
        Number.isSafeInteger(grouping) && grouping >= 0 && grouping <= row.cost,
      );
      assert.ok(Number.isSafeInteger(optimisticFiveTopic));
      const logged = settlements.filter(
        (part) => part.runId === window.editionId,
      );
      assert.ok(
        logged.every(
          (part) =>
            Number.isSafeInteger(part.costMicros) && part.costMicros >= 0,
        ),
      );
      const purposes = [
        ...new Set([
          ...logged.map((part) => part.purpose),
          ...ledger.byModelAndPurpose.map((part) => part.purpose),
        ]),
      ];
      const reconciled = purposes.every((purpose) => {
        const records = logged.filter((part) => part.purpose === purpose);
        const parts = ledger.byModelAndPurpose.filter(
          (part) => part.purpose === purpose,
        );
        return (
          records.reduce((sum, part) => sum + part.costMicros, 0) ===
            parts.reduce((sum, part) => sum + part.costMicros, 0) &&
          records.length ===
            parts.reduce((sum, part) => sum + part.calls - part.failed, 0)
        );
      });
      const worldCost = logged
        .filter(
          (part) => part.topicId === '00000000-0000-4000-8000-000000000014',
        )
        .reduce((sum, part) => sum + part.costMicros, 0);
      const unattributedCost = logged
        .filter((part) => !part.topicId)
        .reduce((sum, part) => sum + part.costMicros, 0);
      const worldTriageAndGroupingCost = logged
        .filter(
          (part) =>
            part.topicId === '00000000-0000-4000-8000-000000000014' &&
            [
              'candidate-triage-v1',
              'social-triage-v1',
              'story-grouping-v3',
            ].includes(part.purpose),
        )
        .reduce((sum, part) => sum + part.costMicros, 0);
      if (reconciled) assert.ok(worldCost + unattributedCost <= row.cost);
      measurements.push({
        settlementAttribution: {
          reconciled,
          loggedCalls: logged.length,
          worldTriageAndGroupingCostMicros: reconciled
            ? worldTriageAndGroupingCost
            : null,
          worldByPurpose: reconciled
            ? purposes
                .map((purpose) => ({
                  purpose,
                  costMicros: logged
                    .filter(
                      (part) =>
                        part.purpose === purpose &&
                        part.topicId === '00000000-0000-4000-8000-000000000014',
                    )
                    .reduce((sum, part) => sum + part.costMicros, 0),
                }))
                .filter((part) => part.costMicros > 0)
            : null,
          worldCostMicros: reconciled ? worldCost : null,
          unattributedCostMicros: reconciled ? unattributedCost : null,
          // Over-credit every unknown call to World, and remove World for free.
          maximumWorldSavingsMicros: reconciled
            ? worldCost + unattributedCost
            : null,
        },
        date: window.date,
        costMicros: row.cost,
        fifthTopicProxyMicros: Math.ceil(row.cost / row.topics),
        allTopicGroupingCostMicros: grouping,
        optimisticReserveWithFreeGroupingMicros: Math.ceil(
          optimisticFiveTopic * headroom,
        ),
        byPurpose: ledger.byModelAndPurpose.map((part) => ({
          model: part.model,
          purpose: part.purpose,
          calls: part.calls,
          failed: part.failed,
          costMicros: part.costMicros,
        })),
      });
    }
    const complete = await readFullAiEditionCosts(client, new Date());
    assert.ok(complete.length > 0);
    const projected = Math.max(
      ...measurements.map((row) => row.costMicros + row.fifthTopicProxyMicros),
      ...complete.map((cost) => Math.ceil((cost * 5) / 4)),
    );
    // A cap is a ceiling, not a grant: preserve the production monthly pacing.
    const now = new Date(
      (
        await client.query<{ now: string }>(
          'SELECT clock_timestamp()::text AS now',
        )
      ).rows[0].now,
    );
    const usage = await readUsage(
      client,
      { ...config.caps, dailyMax: 650000 },
      now,
    );
    const requiredReserveMicros = Math.ceil(projected * headroom);
    const nextDay = new Date(
      utcBudgetPeriod(now).dayStart.getTime() + 86400000,
    );
    const nextAllowance = budgetAllowance(
      nextDay,
      {
        month: usage.monthMicros + usage.monthReservedMicros,
        today: usage.todayReservedMicros,
      },
      { ...config.caps, dailyMax: 650000 },
    );
    const scenarios = [
      {
        label: 'current-day snapshot',
        at: now,
        dailyCap: usage.dailyCapMicros,
        available: usage.availableMicros,
        todayUsed: usage.todayMicros + usage.todayReservedMicros,
      },
      {
        label: 'next UTC day, no intervening spend or hold settlement',
        at: nextDay,
        ...nextAllowance,
        todayUsed: usage.todayReservedMicros,
      },
    ].map(({ label, at, ...input }) => {
      const protectedBudget = scheduledReserveAllowance(
        {
          ...input,
          recentFullAiEditionCosts: [projected],
          state: 'pending',
          scheduledRun: true,
        },
        { headroom },
      );
      assert.equal(
        protectedBudget.sizedReserveMicros,
        Math.min(input.dailyCap, requiredReserveMicros),
      );
      assert.equal(protectedBudget.availableMicros, input.available);
      // Solve ceil(cost * headroom) <= cap in integer microdollars. This
      // frontier needs no equal-share assumption or topic attribution.
      const costCeilingMicros = Math.floor(input.dailyCap / headroom);
      assert.ok(Math.ceil(costCeilingMicros * headroom) <= input.dailyCap);
      assert.ok(Math.ceil((costCeilingMicros + 1) * headroom) > input.dailyCap);
      const frontier = measurements.map((row) => {
        const maximumNetIncrementMicros = costCeilingMicros - row.costMicros;
        const baselineWithoutAnyGroupingMicros =
          row.costMicros - row.allTopicGroupingCostMicros;
        return {
          date: row.date,
          reductionStillNeededWithFreeWorldMicros:
            row.settlementAttribution.maximumWorldSavingsMicros === null
              ? null
              : Math.max(
                  0,
                  row.costMicros -
                    row.settlementAttribution.maximumWorldSavingsMicros -
                    costCeilingMicros,
                ),
          reductionStillNeededWithFreeWorldTriageAndGroupingMicros:
            row.settlementAttribution.worldTriageAndGroupingCostMicros === null
              ? null
              : Math.max(
                  0,
                  row.costMicros -
                    row.settlementAttribution.worldTriageAndGroupingCostMicros -
                    costCeilingMicros,
                ),
          maximumCombinedWorldUsCostMicros:
            row.settlementAttribution.worldCostMicros === null
              ? null
              : costCeilingMicros -
                (row.costMicros - row.settlementAttribution.worldCostMicros),
          baselineCostMicros: row.costMicros,
          maximumNetIncrementMicros,
          baselineReductionBeforeAnyAdditionMicros: Math.max(
            0,
            -maximumNetIncrementMicros,
          ),
          reductionStillNeededWithFreeGroupingMicros: Math.max(
            0,
            baselineWithoutAnyGroupingMicros - costCeilingMicros,
          ),
        };
      });
      return {
        label,
        at: at.toISOString(),
        ...input,
        requiredReserveMicros,
        protectedReserveMicros: protectedBudget.reserveMicros,
        reserveShortfallMicros: Math.max(
          0,
          requiredReserveMicros - input.dailyCap,
        ),
        fullReserveFits: requiredReserveMicros <= input.dailyCap,
        projectedCostFitsAvailable: projected <= input.available,
        costCeilingMicros,
        savedCostFrontier: frontier,
      };
    });
    console.log(
      JSON.stringify(
        {
          wholeEditionAdmission: {
            ownerDailyCeilingMicros: 650000,
            monthlyCapMicros: config.caps.monthly,
            monthSpentMicros: usage.monthMicros,
            unresolvedHoldsMicros: usage.monthReservedMicros,
            modelAllocation: usage.modelAllocation,
            scenarios,
            note: 'Read-only necessary-condition check using equal-share cost proxy. Clamped protected reserve is not evidence that full 1.5x headroom fits. Next-day projection is conditional; neither scenario proves per-request/model admission, new domestic volume or editorial quality.',
          },
          measurements,
          recentCompleteEditionCostsMicros: complete,
          projectedFiveTopicMicros: projected,
          reserveAt1_5Micros: Math.ceil(projected * 1.5),
          configuredDailyMaxMicros: config.caps.dailyMax,
          configuredReserve: reserve,
          ownerDailyCeilingMicros: 650000,
          fitsOwnerCeiling: Math.ceil(projected * 1.5) <= 650000,
          optimisticReserveWithFreeGroupingMicros: Math.max(
            ...measurements.map(
              (row) => row.optimisticReserveWithFreeGroupingMicros,
            ),
          ),
          savingsNote:
            'Optimistic counterfactual only: removes ALL four topics grouping cost, adds no joint request cost, and retains the equal-share fifth-topic proxy. Not an achievable saving, cost attribution or production admission calculation.',
          note: 'Equal-share fifth-topic proxy, llm_calls has no topic ID; separate journal attribution is reported only when every purpose reconciles by successful call count and cost. Includes all saved-run costs, including repairs. Does not bound new candidate volume, joint prompt size or monthly/model admission. No cap change justified solely by this proxy.',
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
