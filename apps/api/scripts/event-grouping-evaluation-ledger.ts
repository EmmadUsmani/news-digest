import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

// Per-execution ceiling in addition to the durable shared ledger, never a
// replacement for daily/monthly caps, scheduled reserve or verification limits.
// No live entrypoint uses this until the complete labelled evaluation is ready.
export function eventGroupingEvaluationLedger(
  ledger: LlmLedger,
  options: {
    live: string | undefined;
    runId: string;
    modelId: string;
    capMicros: number;
    now?: () => Date;
  },
): LlmLedger {
  const now = options.now ?? (() => new Date());
  const gate = () => {
    const date = now();
    if (
      options.live !== '1' ||
      !Number.isFinite(date.getTime()) ||
      (date.getUTCHours() >= 13 && date.getUTCHours() < 16)
    )
      throw new Error(
        'Evaluation requires live opt-in outside 13:00–16:00 UTC',
      );
  };
  if (
    !options.runId ||
    !options.modelId ||
    !Number.isSafeInteger(options.capMicros) ||
    options.capMicros < 1 ||
    options.capMicros > 100000
  )
    throw new Error('Invalid evaluation budget or identity');
  gate();
  let reserved = 0;
  return {
    async reserve(request: LlmRequest, estimate: number) {
      gate();
      if (
        request.runId !== options.runId ||
        request.model.id !== options.modelId ||
        request.purpose !== 'event-grouping-v2' ||
        !Number.isSafeInteger(estimate) ||
        estimate < 1
      )
        throw new Error('Invalid evaluation reservation');
      if (estimate > options.capMicros - reserved) return null;
      // Claim before awaiting the shared ledger, so overlapping requests cannot
      // race. Never refund estimates, even on refusal/failure: uncertainty and
      // retries cannot create extra headroom within this execution.
      reserved += estimate;
      return ledger.reserve(request, estimate);
    },
    settle: (id, usage, cost) => ledger.settle(id, usage, cost),
    fail: (id, code, limit, uncertain) =>
      ledger.fail(id, code, limit, uncertain),
    cached: (key) => ledger.cached(key),
    cache: (key, response) => ledger.cache(key, response),
  };
}
