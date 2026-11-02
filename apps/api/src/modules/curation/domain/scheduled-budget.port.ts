import type { ScheduledEditionState } from './scheduled-reserve';

export interface ScheduledBudgetOutcome {
  editionId: string;
  mode: 'full-ai' | 'mixed' | 'fallback';
  reason: string;
}
export interface ScheduledBudgetDay {
  budgetDay: string;
  scheduledAt: Date;
  runId: string;
  state: ScheduledEditionState;
  attempt: number;
  outcome: ScheduledBudgetOutcome | null;
}
// Trusted scheduler/worker lifecycle only. LLM purpose strings cannot create
// these identities. A claimed attempt fences late completion from old workers.
export interface ScheduledBudgetRepository {
  register(scheduledAt: Date, runId: string): Promise<ScheduledBudgetDay>;
  // Compare-and-swap only an unclaimed slot within the same UTC budget day.
  // A stale settings refresh must not replace a newer identity or active work.
  reconcilePending(
    budgetDay: string,
    expectedRunId: string,
    scheduledAt: Date,
    runId: string,
  ): Promise<boolean>;
  // Remove an obsolete, never-claimed slot only if its observed identity matches.
  removePending(budgetDay: string, expectedRunId: string): Promise<boolean>;
  read(budgetDay: string): Promise<ScheduledBudgetDay | null>;
  // Recovery is permitted only with queue evidence of a redelivered job and
  // the observed running attempt; compare-and-swap fences the old worker.
  claim(
    runId: string,
    recoverAttempt?: number,
  ): Promise<ScheduledBudgetDay | null>;
  finishAttempt(
    runId: string,
    attempt: number,
    state: 'retrying' | 'failed' | 'succeeded',
    outcome?: ScheduledBudgetOutcome,
  ): Promise<boolean>;
}
