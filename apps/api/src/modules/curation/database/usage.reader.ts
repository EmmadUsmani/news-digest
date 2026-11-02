import type { LlmUsage } from '@digest/contracts';
import type { Pool } from 'pg';

import {
  budgetAllowance,
  type BudgetCaps,
  modelBudgetAvailable,
  utcBudgetPeriod,
} from '../domain/budget';

export async function readUsage(db: Pool, caps: BudgetCaps): Promise<LlmUsage> {
  const now = (await db.query<{ now: Date }>('SELECT clock_timestamp() AS now'))
    .rows[0].now;
  const period = utcBudgetPeriod(now);
  const totals = (
    await db.query<{
      monthMicros: number;
      todayMicros: number;
      monthReservedMicros: number;
      todayReservedMicros: number;
    }>(
      `
    SELECT COALESCE(sum(cost_micros) FILTER (WHERE created_at >= $1),0)::float8 AS "monthMicros",
    COALESCE(sum(cost_micros) FILTER (WHERE created_at >= $2),0)::float8 AS "todayMicros",
    COALESCE(sum(reserved_micros) FILTER (WHERE status IN ('pending','uncertain')),0)::float8 AS "monthReservedMicros",
    COALESCE(sum(reserved_micros) FILTER (WHERE status IN ('pending','uncertain')),0)::float8 AS "todayReservedMicros"
    FROM llm_calls`,
      [period.monthStart, period.dayStart],
    )
  ).rows[0];
  const allowance = budgetAllowance(
    now,
    {
      month: totals.monthMicros + totals.monthReservedMicros,
      today: totals.todayMicros + totals.todayReservedMicros,
    },
    caps,
  );
  const models = (
    await db.query<{ model: string; calls: number; costMicros: number }>(
      `SELECT model,count(*)::int AS calls,COALESCE(sum(cost_micros),0)::float8 AS "costMicros" FROM llm_calls WHERE created_at >= $1 GROUP BY model ORDER BY model`,
      [period.monthStart],
    )
  ).rows;
  const purposes = (
    await db.query<{
      purpose: string;
      todayMicros: number;
      monthMicros: number;
      reservedMicros: number;
    }>(
      `SELECT purpose,
       COALESCE(sum(cost_micros) FILTER (WHERE created_at >= $2),0)::float8 AS "todayMicros",
       COALESCE(sum(cost_micros) FILTER (WHERE created_at >= $1),0)::float8 AS "monthMicros",
       COALESCE(sum(reserved_micros) FILTER (WHERE status IN ('pending','uncertain')),0)::float8 AS "reservedMicros"
       FROM llm_calls WHERE created_at >= $1 OR status IN ('pending','uncertain')
       GROUP BY purpose ORDER BY purpose`,
      [period.monthStart, period.dayStart],
    )
  ).rows;
  const last = (
    await db.query<{ code: string; at: Date }>(
      `SELECT error_code AS code,completed_at AS at FROM llm_calls WHERE error_code IS NOT NULL ORDER BY completed_at DESC LIMIT 1`,
    )
  ).rows[0];
  const block = await db.query(
    'SELECT 1 FROM llm_provider_blocks WHERE month_start=$1',
    [period.monthStart],
  );
  let modelAllocation;
  if (caps.modelAllocation) {
    const allocation = caps.modelAllocation;
    const used = (
      await db.query<{ used: number }>(
        `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS used
       FROM llm_calls WHERE model=$1 AND status <> 'failed'
       AND (created_at >= $2 OR status IN ('pending','uncertain'))`,
        [allocation.model, period.dayStart],
      )
    ).rows[0].used;
    modelAllocation = {
      model: allocation.model,
      dailyCapMicros: Math.floor(allowance.dailyCap * allocation.dailyFraction),
      usedMicros: used,
      availableMicros: block.rowCount
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
    availableMicros: block.rowCount ? 0 : allowance.available,
    blockedUntil: block.rowCount ? period.nextMonth.toISOString() : null,
    models,
    lastError: last ? { code: last.code, at: last.at.toISOString() } : null,
  };
}
