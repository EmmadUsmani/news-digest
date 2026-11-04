import type { LlmUsage } from '@digest/contracts';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';

import {
  llmCalls as calls,
  llmProviderBlocks as blocks,
} from '../../../libs/db/schema';
import {
  budgetAllowance,
  type BudgetCaps,
  modelBudgetAvailable,
  utcBudgetPeriod,
} from '../domain/budget';

export async function readUsage(
  db: Pool | PoolClient,
  caps: BudgetCaps,
  snapshotTime?: Date,
): Promise<LlmUsage> {
  const orm = drizzle(db);
  // PostgreSQL clock and filtered sums have no equivalent query-builder operation.
  const now =
    snapshotTime ??
    new Date(
      (await orm.execute<{ now: string }>(sql`SELECT clock_timestamp() AS now`))
        .rows[0].now,
    );
  const period = utcBudgetPeriod(now);
  const month = gte(calls.createdAt, period.monthStart.toISOString());
  const day = gte(calls.createdAt, period.dayStart.toISOString());
  const unresolved = inArray(calls.status, ['pending', 'uncertain']);
  const monthCost = sql<number>`COALESCE(sum(${calls.costMicros}) FILTER (WHERE ${month}),0)::float8`;
  const dayCost = sql<number>`COALESCE(sum(${calls.costMicros}) FILTER (WHERE ${day}),0)::float8`;
  // Unresolved holds count across all dates, including earlier budget periods.
  const reserved = sql<number>`COALESCE(sum(${calls.reservedMicros}) FILTER (WHERE ${unresolved}),0)::float8`;
  const [totals] = await orm
    .select({
      monthMicros: monthCost,
      todayMicros: dayCost,
      monthReservedMicros: reserved,
      todayReservedMicros: reserved,
    })
    .from(calls);
  const allowance = budgetAllowance(
    now,
    {
      month: totals.monthMicros + totals.monthReservedMicros,
      today: totals.todayMicros + totals.todayReservedMicros,
    },
    caps,
  );
  const models = await orm
    .select({
      model: calls.model,
      calls: count(),
      costMicros: sql<number>`COALESCE(sum(${calls.costMicros}),0)::float8`,
    })
    .from(calls)
    .where(month)
    .groupBy(calls.model)
    .orderBy(asc(calls.model));
  const purposes = await orm
    .select({
      purpose: calls.purpose,
      todayMicros: dayCost,
      monthMicros: monthCost,
      reservedMicros: reserved,
    })
    .from(calls)
    .where(or(month, unresolved))
    .groupBy(calls.purpose)
    .orderBy(asc(calls.purpose));
  const [last] = await orm
    .select({ code: calls.errorCode, at: calls.completedAt })
    .from(calls)
    .where(isNotNull(calls.errorCode))
    .orderBy(desc(calls.completedAt))
    .limit(1);
  const block = await orm
    .select({ month: blocks.monthStart })
    .from(blocks)
    .where(eq(blocks.monthStart, period.monthStart.toISOString().slice(0, 10)));
  let modelAllocation;
  if (caps.modelAllocation) {
    const allocation = caps.modelAllocation;
    const [{ used }] = await orm
      .select({
        used: sql<number>`COALESCE(sum(COALESCE(${calls.costMicros},${calls.reservedMicros})),0)::float8`,
      })
      .from(calls)
      .where(
        and(
          eq(calls.model, allocation.model),
          ne(calls.status, 'failed'),
          or(day, unresolved),
        ),
      );
    modelAllocation = {
      model: allocation.model,
      dailyCapMicros: Math.floor(allowance.dailyCap * allocation.dailyFraction),
      usedMicros: used,
      availableMicros: block.length
        ? 0
        : Math.min(
            allowance.available,
            modelBudgetAvailable(
              allowance.dailyCap,
              used,
              allocation.dailyFraction,
            ),
          ),
    };
  }
  return {
    ...totals,
    purposes,
    modelAllocation,
    dailyCapMicros: allowance.dailyCap,
    monthlyCapMicros: caps.monthly,
    availableMicros: block.length ? 0 : allowance.available,
    blockedUntil: block.length ? period.nextMonth.toISOString() : null,
    models,
    lastError:
      last?.code != null
        ? { code: last.code, at: new Date(last.at!).toISOString() }
        : null,
  };
}
