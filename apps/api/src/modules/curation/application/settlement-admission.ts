import type { LlmExecutionContext, LlmRequest } from '../domain/llm.port';
import type {
  LlmLedger,
  LlmReservationResult,
} from '../domain/llm-ledger.port';

type DetailedLedger = Required<
  Pick<LlmLedger, 'reserveDetailed' | 'pendingOriginalHolds'>
>;
type Stop =
  | 'admitted'
  | 'ineligible'
  | 'cancelled'
  | 'deadline'
  | 'exhausted'
  | 'holds-settled';

// Internal opt-in only: production callers still use immediate reserve().
export async function admitAfterSettlement(
  ledger: DetailedLedger,
  request: LlmRequest,
  estimate: number,
  options: {
    scheduled: boolean;
    sonnetModel: string;
    execution?: LlmExecutionContext;
    signal?: AbortSignal;
    now: () => number;
    sleep: (ms: number) => Promise<void>;
  },
): Promise<{
  result: LlmReservationResult;
  stop: Stop;
  attempts: number;
  waitedMs: number;
  originalHoldCount: number;
}> {
  const started = options.now();
  let attempts = 0;
  let originalIds: string[] = [];
  // AI queue + complete logical call + fallback/publication headroom.
  const headroom = 10_000 + 200_000 + 90_000;
  const timingStop = (): Stop | undefined => {
    if (options.signal?.aborted) return 'cancelled';
    if (
      options.execution &&
      (!Number.isFinite(options.execution.deadline) ||
        options.now() + headroom >= options.execution.deadline)
    )
      return 'deadline';
    return undefined;
  };
  // The initial atomic attempt is always immediate, preserving legacy admission.
  let result = await ledger.reserveDetailed(request, estimate);
  attempts++;
  const finish = (stop: Stop) => ({
    result,
    stop,
    attempts,
    waitedMs: Math.max(0, options.now() - started),
    originalHoldCount: originalIds.length,
  });
  const eligible = () =>
    result.status === 'refused' &&
    result.reasons.length === 1 &&
    result.reasons[0] === 'model-allocation' &&
    !result.pendingHoldsOverflow;
  if (result.status === 'admitted') return finish('admitted');
  if (
    !options.scheduled ||
    !options.execution ||
    request.model.id !== options.sonnetModel ||
    !eligible() ||
    result.pendingHolds.length === 0 ||
    result.pendingHolds.length > 64 ||
    result.pendingHolds.some((hold) => hold.model !== request.model.id)
  )
    return finish('ineligible');
  originalIds = [...new Set(result.pendingHolds.map((hold) => hold.id))];
  for (;;) {
    const stop = timingStop();
    if (stop) return finish(stop);
    const elapsed = options.now() - started;
    if (elapsed >= 5_000 || attempts >= 21) return finish('exhausted');
    await options.sleep(Math.min(250, 5_000 - elapsed));
    const afterSleep = timingStop();
    if (afterSleep) return finish(afterSleep);
    if (options.now() - started > 5_000) return finish('exhausted');
    // No transaction or connection is held while sleeping. Query only frozen IDs.
    const pending = await ledger.pendingOriginalHolds(
      request.model.id,
      originalIds,
    );
    const afterQuery = timingStop();
    if (afterQuery) return finish(afterQuery);
    if (options.now() - started > 5_000) return finish('exhausted');
    // Even the final settlement gets one atomic attempt; only that attempt can
    // authorize spending. A further refusal with no original holds ends waiting.
    result = await ledger.reserveDetailed(request, estimate);
    attempts++;
    if (result.status === 'admitted') return finish('admitted');
    if (!eligible()) return finish('ineligible');
    if (!pending.some((id) => originalIds.includes(id)))
      return finish('holds-settled');
  }
}
