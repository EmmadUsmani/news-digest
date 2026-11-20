import { costMicros } from './budget';
import type { LlmRequest } from './llm.port';

// One snapshot must price each model consistently across all planned work.
export function validateEditionModelPrices(requests: readonly LlmRequest[]) {
  const prices = new Map<string, string>();
  for (const { model } of requests) {
    if (typeof model.id !== 'string' || !model.id.trim())
      throw new Error('Invalid edition model identity');
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
