import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { scheduledAiBudgetDays as days } from '../../../libs/db/schema';
import type { ScheduledBudgetOutcome } from '../domain/scheduled-budget.port';
import type { ScheduledEditionState } from '../domain/scheduled-reserve';

// All reads reuse the facade's ledger-locked repeatable-read snapshot.
export async function readReserveClock(client: PoolClient): Promise<Date> {
  // PostgreSQL's wall clock has no query-builder equivalent.
  const { rows } = await drizzle(client).execute<{ now: string }>(
    sql`SELECT clock_timestamp() AS now`,
  );
  return new Date(rows[0].now);
}

export async function readReserveDayState(
  client: PoolClient,
  budgetDay: string,
): Promise<ScheduledEditionState | undefined> {
  const [slot] = await drizzle(client)
    .select({ state: days.state })
    .from(days)
    .where(eq(days.budgetDay, budgetDay));
  return slot?.state as ScheduledEditionState | undefined;
}

export async function readLastReserveOutcome(client: PoolClient, now: Date) {
  const [last] = await drizzle(client)
    .select({
      budgetDay: days.budgetDay,
      scheduledAt: days.scheduledAt,
      state: days.state,
      outcome: days.outcome,
    })
    .from(days)
    .where(
      and(
        inArray(days.state, ['succeeded', 'failed']),
        lte(days.scheduledAt, now.toISOString()),
      ),
    )
    .orderBy(desc(days.scheduledAt))
    .limit(1);
  return last
    ? {
        ...last,
        scheduledAt: new Date(last.scheduledAt),
        state: last.state as 'succeeded' | 'failed',
        outcome: last.outcome as ScheduledBudgetOutcome | null,
      }
    : undefined;
}
