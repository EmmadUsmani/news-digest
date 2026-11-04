import { DrizzleQueryError, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { hasBudgetDayOccurrence } from '../../profiles/public/budget-day';
import { llmConfig, scheduledReserveConfig } from '../adapters/config';
import { scheduledReserveAllowance } from '../domain/scheduled-reserve';
import { readFullAiEditionCosts } from './edition-cost.reader';
import {
  readLastReserveOutcome,
  readReserveClock,
  readReserveDayState,
} from './reserve-status.reader';
import { readUsage } from './usage.reader';

// A single ledger-locked snapshot keeps displayed totals and lifecycle state
// consistent with admission. This is visibility only; it never reserves funds.
export async function readLlmUsageSnapshot(
  db: Pool,
  env: NodeJS.ProcessEnv = process.env,
) {
  const config = scheduledReserveConfig(env);
  const client = await db.connect();
  try {
    return await drizzle(client).transaction(
      async (tx) => {
        // PostgreSQL advisory locking is a function expression in a typed projection.
        await tx
          .select({ lock: sql`pg_advisory_xact_lock(756282)` })
          .from(sql`(values (1)) as singleton(value)`);
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
      },
      { isolationLevel: 'repeatable read' },
    );
  } catch (error) {
    throw error instanceof DrizzleQueryError && error.cause
      ? error.cause
      : error;
  } finally {
    client.release();
  }
}
