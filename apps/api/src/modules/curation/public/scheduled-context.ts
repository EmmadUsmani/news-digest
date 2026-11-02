import { AsyncLocalStorage } from 'node:async_hooks';

interface ScheduledAttempt {
  runId: string;
  attempt: number;
  editionRunId?: string;
}

// Only worker composition establishes a claim. HTTP inputs and purpose tags
// cannot establish ownership; the ledger also checks the durable attempt.
const attempts = new AsyncLocalStorage<ScheduledAttempt>();

export function withScheduledAttempt<T>(
  runId: string,
  attempt: number,
  generate: () => T,
): T {
  return attempts.run({ runId, attempt }, generate);
}

export function withEditionRun<T>(
  scheduledKey: string | undefined,
  editionRunId: string,
  generate: () => T,
): T {
  const claimed = attempts.getStore();
  // Clear inherited privileges for manual or unrelated nested generation.
  return attempts.run(
    claimed && claimed.runId === scheduledKey
      ? { ...claimed, editionRunId }
      : { runId: '', attempt: 0 },
    generate,
  );
}

export function scheduledLedgerContext() {
  const context = attempts.getStore();
  if (!context?.editionRunId) return undefined;
  return {
    runId: context.runId,
    attempt: context.attempt,
    editionRunId: context.editionRunId,
  };
}
