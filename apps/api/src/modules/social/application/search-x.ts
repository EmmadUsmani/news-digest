import { logger } from '../../../libs/observability/logging';
import {
  xDiscoveryCost,
  type XDiscoveryPrice,
} from '../domain/x-discovery-budget';
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
  optionalParentId?: string,
  log = logger,
) {
  // Reject malformed optional requests before admission or any external effects.
  // The ledger still checks the persisted parent, yield, completion and caps.
  if (
    optionalParentId !== undefined &&
    (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(optionalParentId) ||
      scheduledDay === undefined ||
      (request.handles === undefined &&
        request.reactionStory === undefined &&
        request.fixedSearch === undefined))
  )
    throw new Error('Invalid optional X search');
  // Scheduled searches project $0.10 per topic (roughly 5x observed cost).
  // Manual calls retain the full-day hold. Neither is a provider-side ceiling:
  // fetched items are unbounded; actual charges settle before the next search.
  const searchType =
    request.fixedSearch !== undefined
      ? request.fixedSearch.style === 'reactions'
        ? 'fixed-reactions'
        : 'fixed-trending'
      : request.reactionStory !== undefined
        ? 'story-reactions'
        : request.handles === undefined
          ? 'open-topic'
          : 'account-list';
  const estimateMicros = scheduledDay === undefined ? 400000 : 100000;
  const fields = { target: 'xai', runId, topic: topicId, searchType };
  const callId = await ledger.reserve(
    'grok-4.3',
    runId,
    estimateMicros,
    { id: topicId, name: request.topic },
    scheduledDay,
    searchType,
    optionalParentId,
  );
  log.info(
    {
      ...fields,
      event: 'budget.decision',
      estimateMicros,
      outcome: callId ? 'admitted' : 'refused',
    },
    'X discovery budget decision',
  );
  if (!callId) return { state: 'budget-blocked' as const, citations: 0 };
  let result;
  try {
    result = await search.search(request);
  } catch (error) {
    const reason = error instanceof XSearchError ? error.reason : 'uncertain';
    await ledger.fail(callId, reason);
    log.info(
      {
        ...fields,
        callId,
        event: 'budget.failure',
        reason,
        outcome: reason === 'uncertain' ? 'held-uncertain' : 'released',
        providerBlocked: reason === 'credits-depleted',
      },
      'X discovery budget failure recorded',
    );
    return { state: 'failed' as const, callId, reason, citations: 0 };
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
  await ledger.settle(
    callId,
    result.usage,
    billedPrice,
    result.toolCalls,
    result.execution ?? 'unconfirmed',
  );
  log.info(
    {
      ...fields,
      callId,
      event: 'budget.settlement',
      costMicros: xDiscoveryCost(result.usage, billedPrice),
    },
    'X discovery budget settled',
  );
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
    execution: result.execution ?? 'unconfirmed',
  };
}
