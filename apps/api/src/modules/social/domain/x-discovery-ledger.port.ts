import type { XDiscoveryPrice, XDiscoveryUsage } from './x-discovery-budget';

export interface XDiscoveryLedger {
  reserve(
    model: string,
    runId: string,
    estimateMicros: number,
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
