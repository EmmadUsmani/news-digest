import type { DigestPreview } from '@digest/contracts';
import { and, DrizzleQueryError, eq, inArray, or, sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  digestPreviews,
  scheduledAiBudgetDays as days,
} from '../../../libs/db/schema';
import { logger } from '../../../libs/observability/logging';
import type {
  ScheduledBudgetDay,
  ScheduledBudgetOutcome,
  ScheduledBudgetRepository,
} from '../domain/scheduled-budget.port';
import { scheduledOutcome } from '../domain/scheduled-budget-outcome';

// clock_timestamp() below preserves the actual transition time, rather than transaction start.
const fields = {
  budgetDay: days.budgetDay,
  scheduledAt: days.scheduledAt,
  runId: days.runId,
  state: days.state,
  attempt: days.attempt,
  outcome: days.outcome,
};
function toDay(
  row:
    | {
        budgetDay: string;
        scheduledAt: string;
        runId: string;
        state: string;
        attempt: number;
        outcome: unknown;
      }
    | undefined,
): ScheduledBudgetDay | null {
  return row
    ? {
        ...row,
        scheduledAt: new Date(row.scheduledAt),
        state: row.state as ScheduledBudgetDay['state'],
        outcome: row.outcome as ScheduledBudgetOutcome | null,
      }
    : null;
}
const pending = (budgetDay: string, runId: string) =>
  and(
    eq(days.budgetDay, budgetDay),
    eq(days.runId, runId),
    eq(days.state, 'pending'),
    eq(days.attempt, 0),
  );

export class PostgresScheduledBudgetRepository implements ScheduledBudgetRepository {
  constructor(
    private readonly db: Pool,
    private readonly log = logger,
  ) {}

  private async locked<
    T extends boolean | ScheduledBudgetDay | null | undefined,
  >(
    action: (client: NodePgDatabase) => Promise<T>,
    transition: Record<string, unknown>,
  ) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Same lock as Anthropic admission: lifecycle and spend cannot race.
      const db = drizzle(client);
      // Transaction-scoped advisory locks have no query-builder equivalent.
      await db.execute(sql`SELECT pg_advisory_xact_lock(756282)`);
      const result = await action(db);
      await client.query('COMMIT');
      this.log.info(
        {
          event: 'budget.reserve-lifecycle',
          target: 'anthropic',
          ...transition,
          outcome:
            transition.operation === 'register'
              ? 'observed'
              : result === false || result === null
                ? 'unchanged'
                : 'applied',
          ...(typeof result === 'object' && result !== null && 'state' in result
            ? {
                state: result.state,
                attempt: result.attempt,
                runId: result.runId,
              }
            : {}),
        },
        'Scheduled reserve lifecycle',
      );
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    } finally {
      client.release();
    }
  }

  async register(scheduledAt: Date, runId: string) {
    if (!Number.isFinite(scheduledAt.getTime()) || !runId.trim())
      throw new Error('Invalid scheduled budget identity');
    const day = scheduledAt.toISOString().slice(0, 10);
    return this.locked(
      async (client) => {
        await client
          .insert(days)
          .values({
            budgetDay: day,
            scheduledAt: scheduledAt.toISOString(),
            runId,
          })
          .onConflictDoNothing({ target: days.budgetDay });
        const [row] = await client
          .select(fields)
          .from(days)
          .where(eq(days.budgetDay, day));
        // First registration wins, including across restarts and settings changes.
        return toDay(row)!;
      },
      { operation: 'register', budgetDay: day },
    );
  }

  async read(budgetDay: string) {
    const [row] = await drizzle(this.db)
      .select(fields)
      .from(days)
      .where(eq(days.budgetDay, budgetDay));
    return toDay(row);
  }

  async reconcilePending(
    budgetDay: string,
    expectedRunId: string,
    scheduledAt: Date,
    runId: string,
  ) {
    if (
      !Number.isFinite(scheduledAt.getTime()) ||
      scheduledAt.toISOString().slice(0, 10) !== budgetDay ||
      !expectedRunId.trim() ||
      !runId.trim() ||
      runId === expectedRunId
    )
      throw new Error('Invalid scheduled budget reconciliation');
    return this.locked(
      async (client) => {
        const result = await client
          .update(days)
          .set({
            scheduledAt: scheduledAt.toISOString(),
            runId,
            updatedAt: sql`clock_timestamp()`,
          })
          .where(pending(budgetDay, expectedRunId))
          .returning({ runId: days.runId });
        return result.length === 1;
      },
      { operation: 'reconcile-pending', budgetDay, runId, expectedRunId },
    );
  }

  async removePending(budgetDay: string, expectedRunId: string) {
    if (!expectedRunId.trim())
      throw new Error('Invalid scheduled budget removal');
    return this.locked(
      async (client) => {
        const result = await client
          .delete(days)
          .where(pending(budgetDay, expectedRunId))
          .returning({ runId: days.runId });
        return result.length === 1;
      },
      { operation: 'remove-pending', budgetDay, runId: expectedRunId },
    );
  }

  async missPending(budgetDay: string, expectedRunId: string) {
    if (!expectedRunId.trim())
      throw new Error('Invalid missed scheduled budget identity');
    return this.locked(
      async (client) => {
        const result = await client
          .update(days)
          .set({ state: 'failed', updatedAt: sql`clock_timestamp()` })
          .where(pending(budgetDay, expectedRunId))
          .returning({ runId: days.runId });
        return result.length === 1;
      },
      {
        operation: 'miss-pending',
        budgetDay,
        runId: expectedRunId,
        requestedState: 'failed',
      },
    );
  }

  async reconcilePublished(
    budgetDay: string,
    expectedRunId: string,
    expectedAttempt: number,
  ) {
    if (
      !expectedRunId.trim() ||
      !Number.isSafeInteger(expectedAttempt) ||
      expectedAttempt < 0
    )
      throw new Error('Invalid published scheduled budget identity');
    return this.locked(
      async (client) => {
        const [edition] = await client
          .select({ snapshot: digestPreviews.snapshot })
          .from(digestPreviews)
          .where(eq(digestPreviews.scheduledKey, expectedRunId));
        if (!edition) return false;
        const outcome = scheduledOutcome(edition.snapshot as DigestPreview);
        const result = await client
          .update(days)
          .set({
            state: 'succeeded',
            outcome,
            updatedAt: sql`clock_timestamp()`,
          })
          .where(
            and(
              eq(days.budgetDay, budgetDay),
              eq(days.runId, expectedRunId),
              eq(days.attempt, expectedAttempt),
              inArray(days.state, ['pending', 'running', 'retrying']),
            ),
          )
          .returning({ runId: days.runId });
        return result.length === 1;
      },
      {
        operation: 'reconcile-published',
        budgetDay,
        runId: expectedRunId,
        attempt: expectedAttempt,
        requestedState: 'succeeded',
      },
    );
  }

  async claim(runId: string, recoverAttempt?: number) {
    if (
      recoverAttempt !== undefined &&
      (!Number.isSafeInteger(recoverAttempt) || recoverAttempt < 1)
    )
      throw new Error('Invalid scheduled budget recovery attempt');
    return this.locked(
      async (client) => {
        const result = await client
          .update(days)
          .set({
            state: 'running',
            attempt: sql`${days.attempt} + 1`,
            updatedAt: sql`clock_timestamp()`,
          })
          .where(
            and(
              eq(days.runId, runId),
              or(
                inArray(days.state, ['pending', 'retrying']),
                recoverAttempt === undefined
                  ? undefined
                  : and(
                      eq(days.state, 'running'),
                      eq(days.attempt, recoverAttempt),
                    ),
              ),
            ),
          )
          .returning(fields);
        return toDay(result[0]);
      },
      { operation: 'claim', runId, recoverAttempt },
    );
  }

  async finishAttempt(
    runId: string,
    attempt: number,
    state: 'retrying' | 'failed' | 'succeeded',
    outcome?: ScheduledBudgetOutcome,
  ) {
    if (
      !Number.isSafeInteger(attempt) ||
      attempt < 1 ||
      !['retrying', 'failed', 'succeeded'].includes(state) ||
      (state === 'succeeded') !== (outcome !== undefined)
    )
      throw new Error('Invalid scheduled budget transition');
    return this.locked(
      async (client) => {
        const result = await client
          .update(days)
          .set({
            state,
            outcome: outcome ?? null,
            updatedAt: sql`clock_timestamp()`,
          })
          .where(
            and(
              eq(days.runId, runId),
              eq(days.attempt, attempt),
              eq(days.state, 'running'),
            ),
          )
          .returning({ runId: days.runId });
        return result.length === 1;
      },
      { operation: 'finish-attempt', runId, attempt, requestedState: state },
    );
  }
}
