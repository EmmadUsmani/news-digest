import type { DiscoveredLink } from './collection.port';
import type { XDiscoveryUsage } from './x-discovery-budget';

export interface XSearchRequest {
  topic: string;
  guidance: string;
  // Omit for open topic discovery; supplied lists must contain 1–20 handles.
  handles?: string[];
  // Optional event context for budget-permitting unrestricted reactions.
  reactionStory?: { id: string; title: string };
  // Exact UTC interval inside the date-only tool bounds (end is exclusive).
  publicationWindow?: { start: string; end: string };
  fromDate: string;
  toDate: string;
}
// Exact provider-reported tool input; absent fields stay unknown.
export interface XSearchToolCall {
  name: string;
  input: string;
}
export interface XSearchPort {
  search(request: XSearchRequest): Promise<{
    usage: XDiscoveryUsage;
    toolCalls?: XSearchToolCall[];
    links: DiscoveredLink[];
    reportedEngagement?: XReportedEngagement[];
  }>;
}
// Model-reported observations, never official/verified platform metrics.
export interface XReportedEngagement {
  externalId: string;
  reported_by: 'xai_search';
  observedAt: string;
  publishedAt?: string;
  likes?: number;
  reposts?: number;
  replies?: number;
  views?: number;
}
export class XSearchError extends Error {
  constructor(readonly reason: 'credits-depleted' | 'rejected' | 'uncertain') {
    super(`X search ${reason}`);
  }
}
export interface XSearchRepository {
  save(
    topicId: string,
    callId: string,
    links: DiscoveredLink[],
    reportedEngagement?: XReportedEngagement[],
  ): Promise<void>;
}
