import type { Pool } from 'pg';

import { hasBudgetDayOccurrence } from '../../profiles/public/budget-day';
import { llmConfig, scheduledReserveConfig } from '../adapters/config';
import { readFullAiEditionCosts } from '../database/edition-cost.reader';
import { readUsage } from '../database/usage.reader';
import type { ScheduledBudgetOutcome } from '../domain/scheduled-budget.port';
import {
  type ScheduledEditionState,
  scheduledReserveAllowance,
} from '../domain/scheduled-reserve';

// A single ledger-locked snapshot keeps displayed totals and lifecycle state
// consistent with admission. This is visibility only; it never reserves funds.
export async function readLlmUsage(
  db: Pool,
  env: NodeJS.ProcessEnv = process.env,
) {
  const config = scheduledReserveConfig(env);
  const client = await db.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
    await client.query('SELECT pg_advisory_xact_lock(756282)');
    const now = (
      await client.query<{ now: Date }>('SELECT clock_timestamp() AS now')
    ).rows[0].now;
    const budgetDay = now.toISOString().slice(0, 10);
    const usage = await readUsage(client, llmConfig(env).caps, now);
    const slot = (
      await client.query<{ state: ScheduledEditionState }>(
        'SELECT state FROM scheduled_ai_budget_days WHERE budget_day=$1',
        [budgetDay],
      )
    ).rows[0];
    const state =
      slot?.state ??
      ((await hasBudgetDayOccurrence(client, budgetDay))
        ? 'pending'
        : 'not-scheduled');
    const policy = scheduledReserveAllowance(
      {
        dailyCap: usage.dailyCapMicros,
        available: usage.availableMicros,
        todayUsed: usage.todayMicros + usage.todayReservedMicros,
        recentFullAiEditionCosts: await readFullAiEditionCosts(client, now),
        state,
        scheduledRun: false,
      },
      config.policy,
    );
    // Disabled policy must not claim funds are protected or manual runs limited.
    const effective = config.enabled
      ? policy
      : scheduledReserveAllowance(
          {
            dailyCap: usage.dailyCapMicros,
            available: usage.availableMicros,
            todayUsed: usage.todayMicros + usage.todayReservedMicros,
            recentFullAiEditionCosts: [],
            state,
            scheduledRun: false,
          },
          { configuredMicros: 0, headroom: 1 },
        );
    const last = (
      await client.query<{
        budgetDay: string;
        scheduledAt: Date;
        state: 'succeeded' | 'failed';
        outcome: ScheduledBudgetOutcome | null;
      }>(
        `SELECT budget_day::text AS "budgetDay",scheduled_at AS "scheduledAt",state,outcome
       FROM scheduled_ai_budget_days WHERE state IN ('succeeded','failed')
       AND scheduled_at <= $1 ORDER BY scheduled_at DESC LIMIT 1`,
        [now],
      )
    ).rows[0];
    await client.query('COMMIT');
    return {
      ...usage,
      scheduledReserve: {
        enabled: config.enabled,
        budgetDay,
        state,
        lastOutcome: last
          ? { ...last, scheduledAt: last.scheduledAt.toISOString() }
          : null,
        sizedReserveMicros: policy.sizedReserveMicros,
        reserveMicros: effective.reserveMicros,
        otherSpendLimitMicros: effective.otherSpendLimitMicros,
        otherAvailableMicros: effective.otherAvailableMicros,
        limitedByReserve: effective.limitedByReserve,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
