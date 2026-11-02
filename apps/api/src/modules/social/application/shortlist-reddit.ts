import type { RelevancePolicy } from '@digest/contracts';

import type { RedditRankingRepository } from '../domain/reddit';
import { rankRedditPosts } from '../domain/reddit-ranking';

// Preparation only: callers must preserve X preference and editorial validation
// when platform-aware edition publication is added.
export async function shortlistReddit(
  repository: RedditRankingRepository,
  topicId: string,
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
) {
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Invalid social coverage window');
  if (!Number.isInteger(budget) || budget <= 0) return [];
  return rankRedditPosts(
    await repository.observations(topicId, start, end),
    policy,
    start,
    end,
    budget,
  );
}
