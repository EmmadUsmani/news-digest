import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';

import { llmCache, llmCalls, llmProviderBlocks } from '../../../libs/db/schema';
import { logger } from '../../../libs/observability/logging';
import {
  budgetAllowance,
  type BudgetCaps,
  modelBudgetAvailable,
  utcBudgetPeriod,
} from '../domain/budget';
import type { LlmRequest, TokenUsage } from '../domain/llm.port';
import type { LlmLedger } from '../domain/llm-ledger.port';
import {
  type ScheduledEditionState,
  scheduledReserveAllowance,
  type ScheduledReservePolicy,
} from '../domain/scheduled-reserve';
import { readFullAiEditionCosts } from './edition-cost.reader';

// Supplied by trusted composition, never by request purpose or HTTP input.
export interface ScheduledLedgerAdmission {
  policy: ScheduledReservePolicy;
  hasOccurrence?(client: PoolClient, day: string): Promise<boolean>;
  context():
    { runId: string; attempt: number; editionRunId: string } | undefined;
}

export interface UsageTotals {
  month: number;
  today: number;
}
export class PostgresLlmLedger implements LlmLedger {
  constructor(
    readonly db: Pool,
    readonly caps: BudgetCaps,
    readonly verification = false,
    readonly scheduled?: ScheduledLedgerAdmission,
    private readonly log = logger,
  ) {}
  async reserve(request: LlmRequest, estimate: number): Promise<string | null> {
    if (!Number.isSafeInteger(estimate) || estimate <= 0)
      throw new Error('Invalid reservation');
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Every process uses the same transaction lock; never hold it during HTTP.
      await client.query('SELECT pg_advisory_xact_lock(756282)');
      const {
        rows: [clock],
      } = await client.query<{ now: Date }>('SELECT clock_timestamp() AS now');
      const now = clock.now;
      const period = utcBudgetPeriod(now);
      const blocked = await client.query(
        'SELECT 1 FROM llm_provider_blocks WHERE month_start=$1',
        [period.monthStart],
      );
      const {
        rows: [totals],
      } = await client.query<UsageTotals>(
        `
        SELECT COALESCE(sum(CASE WHEN created_at >= $1 OR status IN ('pending','uncertain') THEN COALESCE(cost_micros,reserved_micros) ELSE 0 END),0)::float8 AS month,
        COALESCE(sum(CASE WHEN created_at >= $2 OR status IN ('pending','uncertain') THEN COALESCE(cost_micros,reserved_micros) ELSE 0 END),0)::float8 AS today
        FROM llm_calls WHERE status <> 'failed'`,
        [period.monthStart, period.dayStart],
      );
      const allowance = budgetAllowance(now, totals, this.caps);
      // Share the existing lock across processes and repairs. Verification is
      // stricter than the per-iteration owner limit: $0.05 for the whole UTC day.
      const purpose = this.verification ? 'verification' : request.purpose;
      if (purpose === 'verification') {
        const {
          rows: [verification],
        } = await client.query<{ used: number }>(
          `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS used
           FROM llm_calls WHERE purpose='verification' AND status <> 'failed'
           AND (created_at >= $1 OR status IN ('pending','uncertain'))`,
          [period.dayStart],
        );
        if (verification.used + estimate > 50000) {
          await client.query('COMMIT');
          return null;
        }
      }
      let available = allowance.available;
      let reserveDecision: Record<string, unknown> | undefined;
      if (this.scheduled) {
        const {
          rows: [slot],
        } = await client.query<{
          run_id: string;
          state: ScheduledEditionState;
          attempt: number;
        }>(
          `SELECT run_id,state,attempt FROM scheduled_ai_budget_days WHERE budget_day=$1`,
          [period.dayStart],
        );
        const context = this.scheduled.context();
        const noOccurrence =
          !slot &&
          this.scheduled.hasOccurrence !== undefined &&
          !(await this.scheduled.hasOccurrence(
            client,
            now.toISOString().slice(0, 10),
          ));
        const scheduledRun =
          !this.verification &&
          purpose !== 'verification' &&
          slot?.state === 'running' &&
          context !== undefined &&
          slot.run_id === context.runId &&
          slot.attempt === context.attempt &&
          request.runId === context.editionRunId;
        const reserve = scheduledReserveAllowance(
          {
            dailyCap: allowance.dailyCap,
            available: allowance.available,
            todayUsed: totals.today,
            recentFullAiEditionCosts: await readFullAiEditionCosts(client, now),
            // Missing lifecycle state fails closed until the scheduler reconciles it.
            state: slot?.state ?? (noOccurrence ? 'not-scheduled' : 'pending'),
            scheduledRun,
          },
          this.scheduled.policy,
        );
        available = reserve.availableMicros;
        reserveDecision = {
          event: 'budget.reserve-decision',
          target: 'anthropic',
          budgetDay: now.toISOString().slice(0, 10),
          state: slot?.state ?? (noOccurrence ? 'not-scheduled' : 'pending'),
          scheduledRun,
          estimateMicros: estimate,
          dailyCapMicros: allowance.dailyCap,
          availableMicros: available,
          reserveMicros: reserve.reserveMicros,
          otherSpendLimitMicros: reserve.otherSpendLimitMicros,
          limitedByReserve: reserve.limitedByReserve,
          reserveInsufficient:
            available < estimate && allowance.available >= estimate,
        };
      }
      const allocation = this.caps.modelAllocation;
      let modelAvailable = Infinity;
      if (allocation && request.model.id === allocation.model) {
        const {
          rows: [modelTotals],
        } = await client.query<{ today: number }>(
          `SELECT COALESCE(sum(COALESCE(cost_micros,reserved_micros)),0)::float8 AS today
           FROM llm_calls WHERE model=$1 AND status <> 'failed'
           AND (created_at >= $2 OR status IN ('pending','uncertain'))`,
          [allocation.model, period.dayStart],
        );
        modelAvailable = modelBudgetAvailable(
          allowance.dailyCap,
          modelTotals.today,
          allocation.dailyFraction,
        );
      }
      if (blocked.rowCount || Math.min(available, modelAvailable) < estimate) {
        await client.query('COMMIT');
        if (reserveDecision)
          this.log.info(
            { ...reserveDecision, outcome: 'refused' },
            'Scheduled reserve admission',
          );
        return null;
      }
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO llm_calls(id,model,purpose,run_id,status,reserved_micros) VALUES($1,$2,$3,$4,'pending',$5)`,
        [id, request.model.id, purpose, request.runId, estimate],
      );
      await client.query('COMMIT');
      if (reserveDecision)
        this.log.info(
          { ...reserveDecision, outcome: 'admitted' },
          'Scheduled reserve admission',
        );
      return id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async settle(id: string, usage: TokenUsage, cost: number) {
    await drizzle(this.db)
      .update(llmCalls)
      .set({
        status: 'succeeded',
        completedAt: sql`now()`,
        costMicros: cost,
        inputTokens: usage.input,
        cacheWriteTokens: usage.cacheWrite,
        cacheReadTokens: usage.cacheRead,
        outputTokens: usage.output,
      })
      .where(and(eq(llmCalls.id, id), eq(llmCalls.status, 'pending')));
  }
  async fail(
    id: string,
    code: string,
    providerLimit: boolean,
    uncertain: boolean,
  ) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(756282)');
      const orm = drizzle(client);
      await orm
        .update(llmCalls)
        .set({
          status: uncertain ? 'uncertain' : 'failed',
          completedAt: sql`now()`,
          errorCode: code,
        })
        .where(and(eq(llmCalls.id, id), eq(llmCalls.status, 'pending')));
      if (providerLimit)
        await orm
          .insert(llmProviderBlocks)
          .values({
            // UTC month calculation must use the transaction's database clock.
            monthStart: sql`date_trunc('month',now() AT TIME ZONE 'UTC')::date`,
            errorCode: code,
          })
          .onConflictDoNothing();
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async cached(key: string): Promise<unknown> {
    const [row] = await drizzle(this.db)
      .select({ response: llmCache.response })
      .from(llmCache)
      .where(eq(llmCache.cacheKey, key));
    return row?.response;
  }
  async cache(key: string, response: unknown) {
    await drizzle(this.db)
      .insert(llmCache)
      .values({ cacheKey: key, response })
      .onConflictDoNothing();
  }
}
