import type { Pool } from 'pg';

import { hasBudgetDayOccurrence } from '../../profiles/public/budget-day';
import { llmConfig, scheduledReserveConfig } from '../adapters/config';
import { readFullAiEditionCosts } from '../database/edition-cost.reader';
import {
  readLastReserveOutcome,
  readReserveClock,
  readReserveDayState,
} from '../database/reserve-status.reader';
import { readUsage } from '../database/usage.reader';
import { scheduledReserveAllowance } from '../domain/scheduled-reserve';

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
    const now = await readReserveClock(client);
    const budgetDay = now.toISOString().slice(0, 10);
    const usage = await readUsage(client, llmConfig(env).caps, now);
    const slot = await readReserveDayState(client, budgetDay);
    const state =
      slot ??
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
    const last = await readLastReserveOutcome(client, now);
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

// Configured ceilings only; the ledger can lower today's actual allowance.
export function configuredLlmCaps(env: NodeJS.ProcessEnv = process.env) {
  const { monthly, dailyMax } = llmConfig(env).caps;
  return { monthlyMicros: monthly, dailyMicros: dailyMax };
}
