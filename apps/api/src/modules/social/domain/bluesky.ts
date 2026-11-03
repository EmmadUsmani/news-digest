// Official API observations; kept separate from production edition candidates.
export interface BlueskyPost {
  platform: 'bluesky';
  externalId: string;
  url: string;
  author: string;
  text: string;
  publishedAt: string;
  observedAt: string;
  metrics: { likes: number; reposts: number; replies: number };
}
export interface BlueskySearchPort {
  search(query: string, since: Date, until: Date): Promise<BlueskyPost[]>;
}
