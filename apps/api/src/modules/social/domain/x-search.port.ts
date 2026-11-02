import type { DiscoveredLink } from './collection.port';
import type { XDiscoveryUsage } from './x-discovery-budget';

export interface XSearchRequest {
  topic: string;
  guidance: string;
  handles: string[];
  fromDate: string;
  toDate: string;
}
export interface XSearchPort {
  search(request: XSearchRequest): Promise<{
    usage: XDiscoveryUsage;
    links: DiscoveredLink[];
  }>;
}
export class XSearchError extends Error {
  constructor(readonly reason: 'credits-depleted' | 'rejected' | 'uncertain') {
    super(`X search ${reason}`);
  }
}
export interface XSearchRepository {
  save(topicId: string, callId: string, links: DiscoveredLink[]): Promise<void>;
}
