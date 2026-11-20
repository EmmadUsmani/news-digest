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
): Promise<{ ledger: LlmLedger; releaseUnused(): Promise<void> } | null> {
  if (!ledger.reserveBatch || !requests.length) return null;
  const entries = requests.map((original) => {
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
    return { request, estimate, identity: identity(request) };
  });
  const result = await ledger.reserveBatch(entries);
  if (result.status !== 'admitted') return null;
  const holds = entries.map((entry, index) => ({
    ...entry,
    id: result.ids[index],
    consumed: false,
  }));
  let closed = false;
  let releasing: Promise<void> | undefined;
  return {
    ledger: {
      reserve: (request, estimate) => {
        if (closed) return Promise.resolve(null);
        const key = identity(request);
        const hold = holds.find(
          (candidate) =>
            !candidate.consumed &&
            candidate.identity === key &&
            candidate.estimate === estimate,
        );
        if (!hold) return Promise.resolve(null);
        hold.consumed = true;
        return Promise.resolve(hold.id);
      },
      cached: (key) =>
        closed ? Promise.resolve(undefined) : ledger.cached(key),
      cache: (key, value) => ledger.cache(key, value),
      settle: (id, usage, cost) => ledger.settle(id, usage, cost),
      fail: (id, code, limit, uncertain) =>
        ledger.fail(id, code, limit, uncertain),
    },
    releaseUnused: () => {
      closed = true;
      releasing ??= (async () => {
        for (const hold of holds) {
          if (hold.consumed) continue;
          await ledger.fail(hold.id, 'plan-unused', false, false);
          hold.consumed = true;
        }
      })().finally(() => {
        releasing = undefined;
      });
      return releasing;
    },
  };
}
