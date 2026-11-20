import { costMicros } from '../domain/budget';
import type { LlmRequest } from '../domain/llm.port';

// Shared by live dispatch, atomic admission and offline edition preflight.
export function llmReservation(request: LlmRequest) {
  if (
    !Number.isSafeInteger(request.maxOutputTokens) ||
    request.maxOutputTokens < 1 ||
    request.maxOutputTokens > 16000
  )
    throw new Error('Invalid output limit');
  const price = request.model;
  // Validate original rates before the conservative maximum can hide one.
  costMicros({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, price);
  const inputBound =
    Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
  const estimate = costMicros(
    {
      input: inputBound,
      output: request.maxOutputTokens,
      cacheRead: 0,
      cacheWrite: 0,
    },
    {
      ...price,
      input: Math.max(price.input, price.cacheRead, price.cacheWrite),
    },
  );
  return { inputBound, estimate };
}
