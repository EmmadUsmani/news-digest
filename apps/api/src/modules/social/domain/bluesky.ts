// Official API observations; kept separate from production edition candidates.
export interface BlueskyPost {
  platform: 'bluesky';
  externalId: string;
  url: string;
  author: string;
  text: string;
  publishedAt: string;
  observedAt: string;
  // Optional until stored observations/cards support media. No remote media fetches.
  media?: BlueskyMedia[];
  metrics: { likes: number; reposts: number; replies: number };
}
export interface BlueskySearchPort {
  search(query: string, since: Date, until: Date): Promise<BlueskyPost[]>;
}

export type BlueskyMedia =
  | { type: 'image'; thumbnail: string; fullsize: string; alt: string }
  | { type: 'video'; thumbnail: string | null; playlist: string; alt: string };
