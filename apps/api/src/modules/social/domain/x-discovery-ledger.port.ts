import type { XDiscoveryPrice, XDiscoveryUsage } from './x-discovery-budget';
import type { XSearchToolCall } from './x-search.port';

export type XDiscoverySearchType =
  | 'open-topic'
  | 'account-list'
  | 'story-reactions'
  | 'fixed-reactions'
  | 'fixed-trending';

export interface XDiscoveryLedger {
  reserve(
    model: string,
    runId: string,
    estimateMicros: number,
    requestedTopic?: { id: string; name: string },
    scheduledDay?: string,
    searchType?: XDiscoverySearchType,
    optionalParentId?: string,
  ): Promise<string | null>;
  settle(
    id: string,
    usage: XDiscoveryUsage,
    price: XDiscoveryPrice,
    toolCalls?: XSearchToolCall[],
  ): Promise<void>;
  fail(
    id: string,
    reason: 'credits-depleted' | 'rejected' | 'uncertain',
  ): Promise<void>;
}
