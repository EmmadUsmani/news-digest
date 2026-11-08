import { costMicros } from '../domain/budget';
import type { LlmPort, LlmRequest, LlmResponse } from '../domain/llm.port';

interface DevelopmentGuard {
  run<T>(
    request: {
      enabled: boolean;
      id: string;
      provider: 'anthropic';
      maxCostMicros: number;
    },
    call: () => Promise<{ value: T; costMicros: number }>,
  ): Promise<
    | { status: 'disabled' | 'replay' }
    | { status: 'budget-refused'; mustReport: boolean }
    | { status: 'complete'; value: T; mustReport: boolean }
  >;
}

/** Explicit development composition only. No production ledger, cache, fallback
 * or retry: the caller owns stable attempt IDs and must handle stopped results.
 */
export function developmentLlm(provider: LlmPort, guard: DevelopmentGuard) {
  return {
    async complete(
      request: LlmRequest,
      attempt: { enabled: boolean; id: string },
    ) {
      if (!attempt.enabled) return { status: 'disabled' as const };
      const bound =
        Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
      if (bound >= 100000) return { status: 'input-limit' as const };
      // Match production's conservative byte bound and worst cache-write rate.
      const maxCostMicros = costMicros(
        {
          input: bound,
          cacheWrite: 0,
          cacheRead: 0,
          output: request.maxOutputTokens,
        },
        {
          ...request.model,
          input: Math.max(
            request.model.input,
            request.model.cacheWrite,
            request.model.cacheRead,
          ),
        },
      );
      return guard.run<LlmResponse>(
        { ...attempt, provider: 'anthropic', maxCostMicros },
        async () => {
          const value = await provider.complete(request);
          return { value, costMicros: costMicros(value.usage, request.model) };
        },
      );
    },
  };
}
