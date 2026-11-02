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
  read(budgetDay: string): Promise<ScheduledBudgetDay | null>;
  claim(runId: string): Promise<ScheduledBudgetDay | null>;
  finishAttempt(
    runId: string,
    attempt: number,
    state: 'retrying' | 'failed' | 'succeeded',
    outcome?: ScheduledBudgetOutcome,
  ): Promise<boolean>;
}
