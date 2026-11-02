import type { SocialPost } from './posts';

export interface DiscoveredLink {
  externalId: string;
  url: string;
  verificationUrl?: string;
}
export interface RiverDiscoveryPort {
  collect(url: string): Promise<DiscoveredLink[]>;
}
export interface SocialCollectionRepository {
  discoverySources(): Promise<{ id: string; url: string }[]>;
  discovered(sourceId: string, links: DiscoveredLink[]): Promise<void>;
  discoveryFailed(sourceId: string): Promise<void>;
  refreshMissingTimes(): Promise<number>;
  candidates(limit: number): Promise<string[]>;
  verificationUrl(id: string): Promise<string | undefined>;
  store(post: SocialPost): Promise<void>;
  checked(id: string, error: string | null): Promise<void>;
}
