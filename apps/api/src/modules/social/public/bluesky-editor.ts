import type { RelevancePolicy } from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyPost } from '../domain/bluesky';
import { shortlistBlueskyPosts } from './bluesky-shortlist';
import type { SocialSelectionServices } from './editorial-selection';

// Explicit preparation only. No publication or scheduler caller.
export async function editBlueskyPosts(
  services: SocialSelectionServices,
  topic: TriageTopic,
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  runId: string,
) {
  if (!Number.isInteger(budget) || budget < 0 || budget > 20)
    throw new Error('Expected Bluesky editorial budget 0–20');
  const shortlist = await shortlistBlueskyPosts(
    services.socialTriage,
    topic,
    posts,
    policy,
    start,
    end,
    budget === 0 ? 0 : 10,
    runId,
  );
  const empty = (status: 'incomplete' | 'unavailable' | 'complete') => ({
    status,
    posts: [],
    model: null,
  });
  if (shortlist.status === 'incomplete') return empty('incomplete');
  if (!shortlist.posts.length) return empty('complete');
  const edited = await services.socialEditor.edit(
    topic,
    shortlist.posts.map(({ post, score }) => ({
      id: score.id,
      platform: 'bluesky',
      text: post.text,
      author: post.author,
      publishedAt: post.publishedAt,
      relevance: score.relevance,
      interestingness: score.importance,
    })),
    budget,
    runId,
  );
  if (!edited) return empty('unavailable');
  if (
    edited.posts.length > budget ||
    new Set(edited.posts.map((p) => p.id)).size !== edited.posts.length ||
    edited.posts.some((p) => !shortlist.posts.some((c) => c.score.id === p.id))
  )
    return empty('incomplete');
  return {
    status: 'complete' as const,
    model: edited.model,
    posts: edited.posts.map((selection) => ({
      ...shortlist.posts.find((c) => c.score.id === selection.id)!,
      whyItMatters: selection.whyItMatters,
      editorialRationale: selection.rationale,
    })),
  };
}
