import {
  type SelectedRedditPost,
  selectedRedditPostSchema,
} from '@digest/contracts';

import type { rankRedditPosts } from '../domain/reddit-ranking';

// Call only with the historical-strength shortlist. Copy through the schema so
// later storage refreshes cannot change evidence prepared for an edition.
export function snapshotRedditPost(
  ranked: ReturnType<typeof rankRedditPosts>[number],
): SelectedRedditPost {
  const { post } = ranked;
  return selectedRedditPostSchema.parse({
    ...post,
    text: `${post.title}\n${post.text}`.trim(),
    displayText: post.text,
    observedAt: ranked.observedAt,
    reasons: [...ranked.reasons],
  });
}
