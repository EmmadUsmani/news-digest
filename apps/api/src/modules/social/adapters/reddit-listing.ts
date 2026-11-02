import { z } from 'zod';

import type { HttpPort } from '../../ingestion/public/discovery';
import type { RedditListingPort, RedditPost } from '../domain/reddit';

const listing = z.object({
  kind: z.literal('Listing'),
  data: z.object({ children: z.array(z.unknown()).max(100) }),
});
const post = z.object({
  kind: z.literal('t3'),
  data: z.object({
    id: z.string().regex(/^[a-z0-9]{1,20}$/),
    subreddit: z.string(),
    title: z.string().min(1).max(1000),
    selftext: z.string().max(40000).default(''),
    author: z.string().regex(/^[A-Za-z0-9_-]{1,32}$/),
    created_utc: z.number().finite().min(1136073600).max(8640000000000),
    permalink: z.string(),
    url: z.string(),
    score: z.number().int().nonnegative(),
    num_comments: z.number().int().nonnegative(),
    upvote_ratio: z.number().min(0).max(1),
    thumbnail: z.string().default(''),
    over_18: z.boolean(),
    stickied: z.boolean(),
    is_self: z.boolean(),
    removed_by_category: z.string().nullable().optional(),
  }),
});
function httpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

// SharedHttpClient supplies the descriptive User-Agent, per-domain serialization,
// response limits, caching and Retry-After backoff. Access denial propagates;
// no retries against alternate hosts, mirrors or authenticated endpoints.
export class RedditListing implements RedditListingPort {
  constructor(private readonly http: HttpPort) {}
  async collect(community: string): Promise<RedditPost[]> {
    if (!/^[A-Za-z0-9_]{2,21}$/.test(community))
      throw new Error('Invalid Reddit community');
    const body = await this.http.get(
      `https://www.reddit.com/r/${community}/top.json?t=day&limit=100`,
    );
    const parsed = listing.parse(JSON.parse(body));
    const posts = new Map<string, RedditPost>();
    for (const child of parsed.data.children) {
      const result = post.safeParse(child);
      if (!result.success) continue;
      const item = result.data.data;
      if (
        item.subreddit.toLowerCase() !== community.toLowerCase() ||
        item.over_18 ||
        item.stickied ||
        item.removed_by_category ||
        item.selftext === '[removed]' ||
        item.selftext === '[deleted]'
      )
        continue;
      const path =
        /^\/r\/([A-Za-z0-9_]+)\/comments\/([a-z0-9]+)\/(?:[A-Za-z0-9_-]+\/?)?$/.exec(
          item.permalink,
        );
      if (
        !path ||
        path[1].toLowerCase() !== community.toLowerCase() ||
        path[2] !== item.id
      )
        continue;
      posts.set(item.id, {
        platform: 'reddit',
        externalId: item.id,
        url: `https://www.reddit.com${item.permalink}`,
        title: item.title,
        text: item.selftext,
        author: item.author,
        authorUrl: `https://www.reddit.com/user/${item.author}/`,
        publishedAt: new Date(item.created_utc * 1000).toISOString(),
        subreddit: item.subreddit,
        metrics: {
          score: item.score,
          comments: item.num_comments,
          upvoteRatio: item.upvote_ratio,
        },
        thumbnail: httpsUrl(item.thumbnail),
        externalUrl: item.is_self ? null : httpsUrl(item.url),
      });
    }
    return [...posts.values()];
  }
}
