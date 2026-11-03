import type { DigestPreview } from '@digest/contracts';
import type { Pool, PoolClient } from 'pg';

import { logger } from '../../../libs/observability/logging';
import type {
  ScheduledBudgetDay,
  ScheduledBudgetOutcome,
  ScheduledBudgetRepository,
} from '../domain/scheduled-budget.port';
import { scheduledOutcome } from '../domain/scheduled-budget-outcome';

const fields = `budget_day::text AS "budgetDay", scheduled_at AS "scheduledAt",
 run_id AS "runId", state, attempt, outcome`;

export class PostgresScheduledBudgetRepository implements ScheduledBudgetRepository {
  constructor(
    private readonly db: Pool,
    private readonly log = logger,
  ) {}

  private async locked<
    T extends boolean | ScheduledBudgetDay | null | undefined,
  >(
    action: (client: PoolClient) => Promise<T>,
    transition: Record<string, unknown>,
  ) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Same lock as Anthropic admission: lifecycle and spend cannot race.
      await client.query('SELECT pg_advisory_xact_lock(756282)');
      const result = await action(client);
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
      throw error;
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
        await client.query(
          `INSERT INTO scheduled_ai_budget_days(budget_day,scheduled_at,run_id)
         VALUES($1,$2,$3) ON CONFLICT (budget_day) DO NOTHING`,
          [day, scheduledAt, runId],
        );
        const result = await client.query<ScheduledBudgetDay>(
          `SELECT ${fields} FROM scheduled_ai_budget_days WHERE budget_day=$1`,
          [day],
        );
        // First registration wins, including across restarts and settings changes.
        return result.rows[0];
      },
      { operation: 'register', budgetDay: day },
    );
  }

  async read(budgetDay: string) {
    const result = await this.db.query<ScheduledBudgetDay>(
      `SELECT ${fields} FROM scheduled_ai_budget_days WHERE budget_day=$1`,
      [budgetDay],
    );
    return result.rows[0] ?? null;
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
        const result = await client.query(
          `UPDATE scheduled_ai_budget_days SET scheduled_at=$3,run_id=$4,
         updated_at=clock_timestamp()
         WHERE budget_day=$1 AND run_id=$2 AND state='pending' AND attempt=0`,
          [budgetDay, expectedRunId, scheduledAt, runId],
        );
        return result.rowCount === 1;
      },
      { operation: 'reconcile-pending', budgetDay, runId, expectedRunId },
    );
  }

  async removePending(budgetDay: string, expectedRunId: string) {
    if (!expectedRunId.trim())
      throw new Error('Invalid scheduled budget removal');
    return this.locked(
      async (client) => {
        const result = await client.query(
          `DELETE FROM scheduled_ai_budget_days
         WHERE budget_day=$1 AND run_id=$2 AND state='pending' AND attempt=0`,
          [budgetDay, expectedRunId],
        );
        return result.rowCount === 1;
      },
      { operation: 'remove-pending', budgetDay, runId: expectedRunId },
    );
  }

  async missPending(budgetDay: string, expectedRunId: string) {
    if (!expectedRunId.trim())
      throw new Error('Invalid missed scheduled budget identity');
    return this.locked(
      async (client) => {
        const result = await client.query(
          `UPDATE scheduled_ai_budget_days SET state='failed',
         updated_at=clock_timestamp()
         WHERE budget_day=$1 AND run_id=$2 AND state='pending' AND attempt=0`,
          [budgetDay, expectedRunId],
        );
        return result.rowCount === 1;
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
        const edition = await client.query<{ snapshot: DigestPreview }>(
          'SELECT snapshot FROM digest_previews WHERE scheduled_key=$1',
          [expectedRunId],
        );
        if (!edition.rows[0]) return false;
        const outcome = scheduledOutcome(edition.rows[0].snapshot);
        const result = await client.query(
          `UPDATE scheduled_ai_budget_days SET state='succeeded',outcome=$4,
         updated_at=clock_timestamp()
         WHERE budget_day=$1 AND run_id=$2 AND attempt=$3
         AND state IN ('pending','running','retrying')`,
          [budgetDay, expectedRunId, expectedAttempt, JSON.stringify(outcome)],
        );
        return result.rowCount === 1;
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
        const result = await client.query<ScheduledBudgetDay>(
          `UPDATE scheduled_ai_budget_days SET state='running',attempt=attempt+1,
         updated_at=clock_timestamp() WHERE run_id=$1 AND
         (state IN ('pending','retrying') OR (state='running' AND attempt=$2))
         RETURNING ${fields}`,
          [runId, recoverAttempt ?? null],
        );
        return result.rows[0] ?? null;
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
        const result = await client.query(
          `UPDATE scheduled_ai_budget_days SET state=$3,outcome=$4,
         updated_at=clock_timestamp() WHERE run_id=$1 AND attempt=$2 AND state='running'`,
          [runId, attempt, state, outcome ? JSON.stringify(outcome) : null],
        );
        return result.rowCount === 1;
      },
      { operation: 'finish-attempt', runId, attempt, requestedState: state },
    );
  }
}
