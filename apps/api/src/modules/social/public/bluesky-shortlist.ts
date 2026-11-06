import type { RelevancePolicy } from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyPost } from '../domain/bluesky';
import { rankSafeBlueskyPosts } from '../domain/bluesky-ranking';
import type { SocialSelectionServices } from './editorial-selection';

// Explicit preparation only: no scheduler, publication or live-service caller.
// An incomplete response cannot turn unscored observations into semantic picks.
export async function shortlistBlueskyPosts(
  triage: SocialSelectionServices['socialTriage'],
  topic: TriageTopic,
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  runId: string,
) {
  if (!Number.isInteger(budget) || budget < 0 || budget > 20)
    throw new Error('Expected Bluesky shortlist budget 0–20');
  const candidates = rankSafeBlueskyPosts(posts, policy, start, end, 50);
  if (!budget || !candidates.length)
    return { status: 'complete' as const, posts: [] };
  const id = (post: BlueskyPost) => `bluesky:${post.externalId}`;
  const result = await triage.score(
    topic,
    candidates.map(({ post }) => ({
      id: id(post),
      title: 'Official Bluesky API post observation',
      excerpt: post.text,
      sources: [],
    })),
    runId,
  );
  const expected = new Set(candidates.map(({ post }) => id(post)));
  if (
    result.unscoredIds.length ||
    result.scores.length !== expected.size ||
    new Set(result.scores.map((s) => s.id)).size !== expected.size ||
    result.scores.some(
      (s) =>
        !expected.has(s.id) ||
        !Number.isInteger(s.relevance) ||
        s.relevance < 0 ||
        s.relevance > 10 ||
        !Number.isInteger(s.importance) ||
        s.importance < 0 ||
        s.importance > 10,
    )
  )
    return {
      status: 'incomplete' as const,
      posts: [],
      failures: result.failures,
    };
  const scores = new Map(result.scores.map((s) => [s.id, s]));
  return {
    status: 'complete' as const,
    posts: candidates
      .flatMap((candidate) => {
        const score = scores.get(id(candidate.post))!;
        return score.relevance >= 6 && score.importance >= 4
          ? [{ ...candidate, score }]
          : [];
      })
      .sort(
        (a, b) =>
          b.score.importance - a.score.importance ||
          b.score.relevance - a.score.relevance ||
          b.strength - a.strength ||
          a.post.externalId.localeCompare(b.post.externalId),
      )
      .slice(0, budget),
  };
}
