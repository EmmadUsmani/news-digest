import type { XDiscoveryPrice, XDiscoveryUsage } from './x-discovery-budget';

export interface XDiscoveryLedger {
  reserve(
    model: string,
    runId: string,
    estimateMicros: number,
    requestedTopic?: { id: string; name: string },
    scheduledDay?: string,
    searchType?: 'open-topic' | 'account-list' | 'story-reactions',
    optionalParentId?: string,
  ): Promise<string | null>;
  settle(
    id: string,
    usage: XDiscoveryUsage,
    price: XDiscoveryPrice,
  ): Promise<void>;
  fail(
    id: string,
    reason: 'credits-depleted' | 'rejected' | 'uncertain',
  ): Promise<void>;
}
