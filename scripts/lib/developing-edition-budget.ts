// Offline preflight only. This does not acquire ledger reservations or dispatch.
import {
  budgetAllowance,
  type BudgetCaps,
  type BudgetTotals,
  costMicros,
  modelBudgetAvailable,
} from '../../apps/api/src/modules/curation/domain/budget';
import type { LlmRequest } from '../../apps/api/src/modules/curation/domain/llm.port';

// One snapshot must price each model consistently across all planned work.
export function validateEditionModelPrices(requests: readonly LlmRequest[]) {
  const prices = new Map<string, string>();
  for (const { model } of requests) {
    costMicros({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, model);
    const signature = JSON.stringify([
      model.input,
      model.output,
      model.cacheRead,
      model.cacheWrite,
    ]);
    const previous = prices.get(model.id);
    if (previous !== undefined && previous !== signature)
      throw new Error('Conflicting edition model prices');
    prices.set(model.id, signature);
  }
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
  const byModel: Record<string, number> = {};
  let featureMicros = 0;
  let oversized = false;
  for (const request of input.requests) {
    if (
      !Number.isSafeInteger(request.maxOutputTokens) ||
      request.maxOutputTokens < 1 ||
      request.maxOutputTokens > 16000
    )
      throw new Error('Invalid output limit');
    const bound =
      Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
    oversized ||= bound >= 100000;
    const price = request.model;
    // Validate original rates before Math.max can hide a negative input or
    // cache rate behind a valid higher rate.
    costMicros({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, price);
    const reserve = costMicros(
      {
        input: bound,
        output: request.maxOutputTokens,
        cacheRead: 0,
        cacheWrite: 0,
      },
      {
        ...price,
        input: Math.max(price.input, price.cacheRead, price.cacheWrite),
      },
    );
    featureMicros = amount(featureMicros + reserve);
    byModel[price.id] = amount((byModel[price.id] ?? 0) + reserve);
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
        (byModel[allocation.model] ?? 0) +
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
    byModel,
    modelRequiredMicros,
    modelAvailableMicros,
  };
}
