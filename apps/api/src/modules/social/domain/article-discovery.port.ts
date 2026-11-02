import type { DiscoveredLink } from './collection.port';

export interface DiscoveryArticle {
  id: string;
  url: string;
  host: string;
}
export interface ArticleDiscoveryRepository {
  candidates(): Promise<DiscoveryArticle[]>;
  record(
    article: DiscoveryArticle,
    links: DiscoveredLink[] | null,
  ): Promise<void>;
}
