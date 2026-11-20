import type { LlmPort, LlmRequest } from '../domain/llm.port';
import type { LlmLedger } from '../domain/llm-ledger.port';
import { BudgetedLlm } from './budgeted-llm';
import { reserveLlmPlan } from './reserved-llm-plan';

// Inactive composition: admit before constructing edition services, and finish
// cleanup before returning anything that a caller could publish. The caller
// still owns complete request capture and protected-obligation derivation.
export async function runReservedLlmPlan<T>(input: {
  editionId: string;
  ledger: LlmLedger;
  provider: LlmPort;
  requests: readonly LlmRequest[];
  protectedRequests: readonly LlmRequest[];
  execute: (llm: BudgetedLlm) => Promise<T>;
}): Promise<
  { status: 'admission-refused' } | { status: 'completed'; value: T }
> {
  if (
    !input.editionId.trim() ||
    [...input.requests, ...input.protectedRequests].some(
      (request) => request.runId !== input.editionId,
    )
  )
    return { status: 'admission-refused' };
  const plan = await reserveLlmPlan(
    input.ledger,
    input.requests,
    input.protectedRequests,
  );
  if (!plan) return { status: 'admission-refused' };
  let value: T;
  try {
    value = await input.execute(new BudgetedLlm(input.provider, plan.ledger));
  } catch (error) {
    try {
      await plan.releaseUnused();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Reserved plan execution and cleanup failed',
      );
    }
    throw error;
  }
  await plan.releaseUnused();
  return { status: 'completed', value };
}
