import type {
  RedditCollectionRepository,
  RedditListingPort,
} from '../domain/reddit';

// Explicit preparation path, deliberately not scheduled while public access is blocked.
// One shared host: stop the entire pass after denial/rate-limit/invalid listing.
export async function collectReddit(
  repository: RedditCollectionRepository,
  listings: RedditListingPort,
) {
  const result = { communities: 0, posts: 0, errors: 0 };
  for (const entry of (await repository.communities()).slice(0, 20)) {
    let posts;
    try {
      posts = await listings.collect(entry.community);
    } catch {
      result.errors++;
      break;
    }
    const matching = posts
      .filter(
        (p) => p.subreddit.toLowerCase() === entry.community.toLowerCase(),
      )
      .slice(0, 100);
    // Storage failures propagate; a failed transaction must not look like success.
    await repository.store(matching, entry.topicIds);
    result.communities++;
    result.posts += matching.length;
  }
  return result;
}
