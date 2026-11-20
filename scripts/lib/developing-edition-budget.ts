import { validateEditionModelPrices } from '../../apps/api/src/modules/curation/domain/model-plan-prices';
export { validateEditionModelPrices } from '../../apps/api/src/modules/curation/domain/model-plan-prices';
import { llmReservation } from '../../apps/api/src/modules/curation/application/llm-reservation';
// Offline preflight only. This does not acquire ledger reservations or dispatch.
import {
  budgetAllowance,
  type BudgetCaps,
  type BudgetTotals,
  modelBudgetAvailable,
} from '../../apps/api/src/modules/curation/domain/budget';
import type { LlmRequest } from '../../apps/api/src/modules/curation/domain/llm.port';

function validateModelId(id: string) {
  if (typeof id !== 'string' || !id.trim())
    throw new Error('Invalid edition model identity');
}

export function developingEditionBudget(input: {
  now: Date;
  totals: BudgetTotals;
  caps: BudgetCaps;
  // Includes settled spend and outstanding reservations, by model.
  modelToday: Record<string, number>;
  // All remaining non-feature work, including intended repairs/fallbacks.
  protectedMicros: number;
  protectedModelMicros: Record<string, number>;
  // Include every possible matching/repair/rewrite dispatch, not just successes.
  requests: readonly LlmRequest[];
}) {
  const amount = (value: number) => {
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error('Invalid edition budget amount');
    return value;
  };
  Object.keys(input.modelToday).forEach(validateModelId);
  Object.keys(input.protectedModelMicros).forEach(validateModelId);
  if (input.caps.modelAllocation)
    validateModelId(input.caps.modelAllocation.model);
  amount(input.protectedMicros);
  Object.values(input.modelToday).forEach(amount);
  Object.values(input.protectedModelMicros).forEach(amount);
  if (
    Object.values(input.protectedModelMicros).reduce(
      (sum, value) => amount(sum + value),
      0,
    ) > input.protectedMicros
  )
    throw new Error('Model obligations exceed shared obligations');
  const allowance = budgetAllowance(input.now, input.totals, input.caps);
  const modelSpent = Object.values(input.modelToday).reduce(
    (sum, value) => amount(sum + value),
    0,
  );
  if (
    input.totals.today > input.totals.month ||
    modelSpent > input.totals.today
  )
    throw new Error('Inconsistent edition budget snapshot');
  validateEditionModelPrices(input.requests);
  const modelCosts = new Map<string, number>();
  let featureMicros = 0;
  let oversized = false;
  for (const request of input.requests) {
    const { inputBound, estimate: reserve } = llmReservation(request);
    oversized ||= inputBound >= 100000;
    const price = request.model;
    featureMicros = amount(featureMicros + reserve);
    modelCosts.set(price.id, amount((modelCosts.get(price.id) ?? 0) + reserve));
  }
  const requiredMicros = amount(input.protectedMicros + featureMicros);
  const allocation = input.caps.modelAllocation;
  if (
    allocation &&
    (!Object.hasOwn(input.modelToday, allocation.model) ||
      !Object.hasOwn(input.protectedModelMicros, allocation.model))
  )
    throw new Error('Missing allocated-model budget snapshot');
  const modelRequiredMicros = allocation
    ? amount(
        (modelCosts.get(allocation.model) ?? 0) +
          (input.protectedModelMicros[allocation.model] ?? 0),
      )
    : null;
  const modelAvailableMicros = allocation
    ? modelBudgetAvailable(
        allowance.dailyCap,
        input.modelToday[allocation.model] ?? 0,
        allocation.dailyFraction,
      )
    : null;
  return {
    status: oversized
      ? 'input-limit'
      : requiredMicros > allowance.available
        ? 'shared-budget-refused'
        : modelRequiredMicros !== null &&
            modelAvailableMicros !== null &&
            modelRequiredMicros > modelAvailableMicros
          ? 'model-budget-refused'
          : 'fits-supplied-plan',
    featureMicros,
    requiredMicros,
    availableMicros: allowance.available,
    byModel: Object.fromEntries(modelCosts),
    modelRequiredMicros,
    modelAvailableMicros,
  };
}
