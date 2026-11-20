import {
  developingCapturedRequests,
  type DevelopingRequestCaptures,
} from '../../apps/api/src/modules/curation/application/developing-captured-requests';
import { developingEditionBudget } from './developing-edition-budget';
import { protectedContextPlan } from './protected-context-plan';
import { protectedWorkManifest } from './protected-work-manifest';
type BudgetInput = Parameters<typeof developingEditionBudget>[0];

// Validates declared contexts before deriving costs. Still offline: the caller
// owns dynamic inventory completeness, and no funds are reserved here.
export function developingInventoryCapturedPlan(
  input: DevelopingRequestCaptures & {
    protectedInventory: Pick<
      Parameters<typeof protectedWorkManifest>[0],
      'expected' | 'supplied'
    >;
    budget: Omit<
      BudgetInput,
      'requests' | 'protectedMicros' | 'protectedModelMicros'
    >;
  },
) {
  if ('protectedRequests' in input)
    throw new Error('Ambiguous protected work inputs');
  const inventory = protectedWorkManifest({
    ...input.protectedInventory,
    editionId: input.editionId,
    topicIds: input.topicIds,
  });
  return {
    ...developingProtectedCapturedPlan({
      ...input,
      protectedRequests: inventory.requests,
    }),
    protectedSlotCount: inventory.slotCount,
  };
}

export function developingCapturedPlan(
  input: DevelopingRequestCaptures & {
    budget: Omit<BudgetInput, 'requests'>;
  },
) {
  const requests = developingCapturedRequests(input);
  return {
    editionId: input.editionId,
    topicCount: input.topicIds.length,
    requestCount: requests.length,
    ...developingEditionBudget({ ...input.budget, requests }),
  };
}

// Request-derived protection for a supplied remaining-work plan. Callers must
// include repair/fallback branches; this cannot prove that the plan is complete.
export function developingProtectedCapturedPlan(
  input: DevelopingRequestCaptures & {
    protectedRequests: readonly import('../../apps/api/src/modules/curation/domain/llm.port').LlmRequest[];
    budget: Omit<
      BudgetInput,
      'requests' | 'protectedMicros' | 'protectedModelMicros'
    >;
  },
) {
  const requests = developingCapturedRequests(input);
  if (
    input.protectedRequests.some((request) => request.runId !== input.editionId)
  )
    throw new Error('Protected request edition differs');
  const allocation = input.budget.caps.modelAllocation;
  const obligations = developingEditionBudget({
    ...input.budget,
    protectedMicros: 0,
    protectedModelMicros: allocation ? { [allocation.model]: 0 } : {},
    requests: input.protectedRequests,
  });
  const result = developingEditionBudget({
    ...input.budget,
    protectedMicros: obligations.featureMicros,
    protectedModelMicros: allocation
      ? { [allocation.model]: 0, ...obligations.byModel }
      : obligations.byModel,
    requests,
  });
  return {
    editionId: input.editionId,
    topicCount: input.topicIds.length,
    requestCount: requests.length,
    protectedRequestCount: input.protectedRequests.length,
    protectedMicros: obligations.featureMicros,
    protectedModelMicros: obligations.byModel,
    ...result,
    status:
      obligations.status === 'input-limit' ? 'input-limit' : result.status,
  };
}

// Derive supplied-context bounds before the same offline budget gate. Neither
// caller-declared inventory nor these size bounds establish runtime admission.
export async function developingContextCapturedPlan(
  input: DevelopingRequestCaptures & {
    protectedContexts: Pick<
      Parameters<typeof protectedContextPlan>[0],
      'expected' | 'contexts'
    >;
    budget: Omit<
      BudgetInput,
      'requests' | 'protectedMicros' | 'protectedModelMicros'
    >;
  },
) {
  if ('protectedRequests' in input || 'protectedInventory' in input)
    throw new Error('Ambiguous protected work inputs');
  const inventory = await protectedContextPlan({
    ...input.protectedContexts,
    editionId: input.editionId,
    topicIds: input.topicIds,
  });
  return {
    ...developingProtectedCapturedPlan({
      ...input,
      protectedRequests: inventory.requests,
    }),
    protectedSlotCount: inventory.slotCount,
  };
}
