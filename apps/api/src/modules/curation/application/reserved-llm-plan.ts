import { costMicros } from '../domain/budget';
import type { LlmRequest } from '../domain/llm.port';
import type { LlmLedger } from '../domain/llm-ledger.port';

// Unlike cache identity, admission binds attribution and every price as well.
function identity(request: LlmRequest): string {
  return JSON.stringify([
    request.runId,
    request.topicId ?? null,
    request.purpose,
    request.instructions,
    request.prompt,
    request.maxOutputTokens,
    request.model.id,
    request.model.input,
    request.model.cacheWrite,
    request.model.cacheRead,
    request.model.output,
  ]);
}

// Inactive composition capability: pass this ledger to BudgetedLlm, then always
// releaseUnused in a finally block. Consumed uncertain holds remain untouched.
export async function reserveLlmPlan(
  ledger: LlmLedger,
  requests: readonly LlmRequest[],
  protectedRequests: readonly LlmRequest[] = [],
): Promise<{ ledger: LlmLedger; releaseUnused(): Promise<void> } | null> {
  if (!ledger.reserveBatch || !requests.length) return null;
  // Protected obligations share the transaction, but cannot be spent through
  // this scope. The caller must release the scope before resuming that work.
  const entries = [...requests, ...protectedRequests].map((original, index) => {
    const request = { ...original, model: { ...original.model } };
    const bound =
      Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
    if (
      bound >= 100000 ||
      !Number.isSafeInteger(request.maxOutputTokens) ||
      request.maxOutputTokens < 1 ||
      request.maxOutputTokens > 16000
    )
      throw new Error('Invalid reserved request bounds');
    const estimate = costMicros(
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
    return {
      request,
      estimate,
      identity: identity(request),
      protected: index >= requests.length,
    };
  });
  const result = await ledger.reserveBatch(entries);
  if (result.status !== 'admitted') return null;
  const holds = entries.map((entry, index) => ({
    ...entry,
    id: result.ids[index],
    consumed: false,
  }));
  const consumedFeatureIds = new Set<string>();
  const assertConsumedFeatureHold = (id: string) => {
    if (!consumedFeatureIds.has(id))
      throw new Error('Hold does not belong to consumed feature work');
  };
  let closed = false;
  let releasing: Promise<void> | undefined;
  return {
    ledger: {
      reserve: (request, estimate) => {
        if (closed) return Promise.resolve(null);
        const key = identity(request);
        const hold = holds.find(
          (candidate) =>
            !candidate.protected &&
            !candidate.consumed &&
            candidate.identity === key &&
            candidate.estimate === estimate,
        );
        if (!hold) return Promise.resolve(null);
        hold.consumed = true;
        consumedFeatureIds.add(hold.id);
        return Promise.resolve(hold.id);
      },
      cached: (key) =>
        closed ? Promise.resolve(undefined) : ledger.cached(key),
      cache: (key, value) => ledger.cache(key, value),
      settle: async (id, usage, cost) => {
        assertConsumedFeatureHold(id);
        await ledger.settle(id, usage, cost);
      },
      fail: async (id, code, limit, uncertain) => {
        assertConsumedFeatureHold(id);
        await ledger.fail(id, code, limit, uncertain);
      },
    },
    releaseUnused: () => {
      closed = true;
      releasing ??= (async () => {
        const errors: unknown[] = [];
        for (const hold of holds) {
          if (hold.consumed) continue;
          try {
            await ledger.fail(hold.id, 'plan-unused', false, false);
            hold.consumed = true;
          } catch (error) {
            // Release independent obligations even if one operation fails.
            // Failed holds remain available to a later cleanup attempt only.
            errors.push(error);
          }
        }
        if (errors.length)
          throw new AggregateError(
            errors,
            'Failed to release unused plan holds',
          );
      })().finally(() => {
        releasing = undefined;
      });
      return releasing;
    },
  };
}
