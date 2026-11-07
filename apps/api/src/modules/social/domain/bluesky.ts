// Official API observations; kept separate from production edition candidates.
export interface BlueskyPost {
  platform: 'bluesky';
  externalId: string;
  url: string;
  author: string;
  text: string;
  // Official link targets expanded for display; original text stays unchanged.
  displayText?: string;
  publishedAt: string;
  observedAt: string;
  // Official media URLs only; no remote media fetches.
  media?: BlueskyMedia[];
  metrics: { likes: number; reposts: number; replies: number };
}
export interface BlueskySearchPort {
  search(query: string, since: Date, until: Date): Promise<BlueskyPost[]>;
}

export type BlueskyMedia =
  | { type: 'image'; thumbnail: string; fullsize: string; alt: string }
  | { type: 'video'; thumbnail: string | null; playlist: string; alt: string };

// Observation storage is isolated from edition candidates and scheduling.
export interface BlueskyRepository {
  store(topicId: string, posts: BlueskyPost[]): Promise<void>;
  observations(
    topicId: string,
    start: Date,
    end: Date,
    cutoff: Date,
  ): Promise<BlueskyPost[]>;
}
