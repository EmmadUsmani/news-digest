import {
  and,
  DrizzleQueryError,
  eq,
  gte,
  inArray,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool, PoolClient } from 'pg';

import {
  llmCache,
  llmCalls,
  llmProviderBlocks,
  scheduledAiBudgetDays,
} from '../../../libs/db/schema';
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
import { readReserveClock } from './reserve-status.reader';

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
  private async transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.db.connect();
    try {
      return await drizzle(client).transaction(async (tx) => {
        // Shared across processes and repairs; never hold this lock during HTTP.
        // PostgreSQL advisory locking remains a function expression.
        await tx
          .select({ lock: sql`pg_advisory_xact_lock(756282)` })
          .from(sql`(values (1)) as singleton(value)`);
        return work(client);
      });
    } catch (error) {
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    } finally {
      client.release();
    }
  }
  async reserve(request: LlmRequest, estimate: number): Promise<string | null> {
    if (!Number.isSafeInteger(estimate) || estimate <= 0)
      throw new Error('Invalid reservation');
    let reserveDecision: Record<string, unknown> | undefined;
    const id = await this.transaction(async (client) => {
      const orm = drizzle(client);
      const now = await readReserveClock(client);
      const period = utcBudgetPeriod(now);
      const blocked = await orm
        .select({ monthStart: llmProviderBlocks.monthStart })
        .from(llmProviderBlocks)
        .where(
          eq(
            llmProviderBlocks.monthStart,
            period.monthStart.toISOString().slice(0, 10),
          ),
        );
      const outstanding = inArray(llmCalls.status, ['pending', 'uncertain']);
      const amount = sql`coalesce(${llmCalls.costMicros}, ${llmCalls.reservedMicros})`;
      // Conditional sums retain outstanding reservations from earlier budget periods;
      // Drizzle has no CASE expression builder. Cast sums to float8 as before.
      const periodTotal = (start: Date) =>
        sql<number>`coalesce(sum(case when ${llmCalls.createdAt} >= ${start.toISOString()} or ${outstanding} then ${amount} else 0 end), 0)::float8`;
      const [totals] = await orm
        .select({
          month: periodTotal(period.monthStart),
          today: periodTotal(period.dayStart),
        })
        .from(llmCalls)
        .where(ne(llmCalls.status, 'failed'));
      const usedSince = async (start: Date, filter: ReturnType<typeof eq>) => {
        const [usage] = await orm
          .select({ used: sql<number>`coalesce(sum(${amount}), 0)::float8` })
          .from(llmCalls)
          .where(
            and(
              filter,
              ne(llmCalls.status, 'failed'),
              or(gte(llmCalls.createdAt, start.toISOString()), outstanding),
            ),
          );
        return usage.used;
      };
      const allowance = budgetAllowance(now, totals, this.caps);
      // Share the existing lock across processes and repairs. Verification is
      // stricter than the per-iteration owner limit: $0.05 for the whole UTC day.
      const purpose = this.verification ? 'verification' : request.purpose;
      if (purpose === 'verification') {
        const verificationUsed = await usedSince(
          period.dayStart,
          eq(llmCalls.purpose, 'verification'),
        );
        if (verificationUsed + estimate > 50000) {
          return null;
        }
      }
      let available = allowance.available;
      if (this.scheduled) {
        const [slot] = await orm
          .select({
            run_id: scheduledAiBudgetDays.runId,
            state: scheduledAiBudgetDays.state,
            attempt: scheduledAiBudgetDays.attempt,
          })
          .from(scheduledAiBudgetDays)
          .where(
            eq(
              scheduledAiBudgetDays.budgetDay,
              period.dayStart.toISOString().slice(0, 10),
            ),
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
            state:
              (slot?.state as ScheduledEditionState | undefined) ??
              (noOccurrence ? 'not-scheduled' : 'pending'),
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
        const modelUsed = await usedSince(
          period.dayStart,
          eq(llmCalls.model, allocation.model),
        );
        modelAvailable = modelBudgetAvailable(
          allowance.dailyCap,
          modelUsed,
          allocation.dailyFraction,
        );
      }
      if (blocked.length || Math.min(available, modelAvailable) < estimate)
        return null;
      const id = crypto.randomUUID();
      await orm.insert(llmCalls).values({
        id,
        model: request.model.id,
        purpose,
        runId: request.runId,
        status: 'pending',
        reservedMicros: estimate,
      });
      return id;
    });
    if (reserveDecision)
      this.log.info(
        { ...reserveDecision, outcome: id === null ? 'refused' : 'admitted' },
        'Scheduled reserve admission',
      );
    return id;
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
    await this.transaction(async (client) => {
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
    });
  }
  async cached(key: string): Promise<unknown> {
    const [row] = await drizzle(this.db)
      .select({ response: llmCache.response })
      .from(llmCache)
      .where(eq(llmCache.cacheKey, key));
    return row?.response;
  }
  async cachedMany(keys: string[]): Promise<Map<string, unknown>> {
    if (keys.length === 0) return new Map();
    const rows = await drizzle(this.db)
      .select({ key: llmCache.cacheKey, response: llmCache.response })
      .from(llmCache)
      .where(inArray(llmCache.cacheKey, [...new Set(keys)]));
    return new Map(rows.map((row) => [row.key, row.response]));
  }
  async cache(key: string, response: unknown) {
    await drizzle(this.db)
      .insert(llmCache)
      .values({ cacheKey: key, response })
      .onConflictDoNothing();
  }
}
