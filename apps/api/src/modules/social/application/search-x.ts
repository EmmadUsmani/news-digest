import type { XDiscoveryPrice } from '../domain/x-discovery-budget';
import type { XDiscoveryLedger } from '../domain/x-discovery-ledger.port';
import {
  XSearchError,
  type XSearchPort,
  type XSearchRepository,
  type XSearchRequest,
} from '../domain/x-search.port';

export async function searchX(
  topicId: string,
  runId: string,
  request: XSearchRequest,
  search: XSearchPort,
  ledger: XDiscoveryLedger,
  repository: XSearchRepository,
  price: XDiscoveryPrice,
  scheduledDay?: string,
) {
  // Scheduled searches project $0.10 per topic (roughly 5x observed cost).
  // Manual calls retain the full-day hold. Neither is a provider-side ceiling:
  // fetched items are unbounded; actual charges settle before the next search.
  const callId = await ledger.reserve(
    'grok-4.3',
    runId,
    scheduledDay === undefined ? 400000 : 100000,
    { id: topicId, name: request.topic },
    scheduledDay,
  );
  if (!callId) return { state: 'budget-blocked' as const, citations: 0 };
  let result;
  try {
    result = await search.search(request);
  } catch (error) {
    await ledger.fail(
      callId,
      error instanceof XSearchError ? error.reason : 'uncertain',
    );
    return { state: 'failed' as const, citations: 0 };
  }
  // Settle before saving citations; a persistence failure must never erase spend.
  // Cumulative input is a conservative proxy for the per-context 200k price tier.
  // Ordinary (non-cache-discounted) rates avoid understating cached input cost.
  const billedPrice =
    result.usage.inputTokens >= 200000
      ? {
          ...price,
          inputPerMillion: price.inputPerMillion * 2,
          outputPerMillion: price.outputPerMillion * 2,
        }
      : price;
  await ledger.settle(callId, result.usage, billedPrice);
  await repository.save(
    topicId,
    callId,
    result.links,
    result.reportedEngagement,
  );
  return {
    state: 'completed' as const,
    callId,
    citations: result.links.length,
    usage: result.usage,
  };
}
