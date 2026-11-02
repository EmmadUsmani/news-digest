// Candidates from public listings; not published selections or verified X posts.
export interface RedditPost {
  platform: 'reddit';
  externalId: string;
  url: string;
  title: string;
  text: string;
  author: string;
  authorUrl: string;
  publishedAt: string;
  subreddit: string;
  metrics: { score: number; comments: number; upvoteRatio: number };
  thumbnail: string | null;
  externalUrl: string | null;
}
export interface RedditListingPort {
  collect(community: string): Promise<RedditPost[]>;
}

export interface RedditCollectionRepository {
  communities(): Promise<{ community: string; topicIds: string[] }[]>;
  store(posts: RedditPost[], topicIds: string[]): Promise<void>;
}
