import type { RelevancePolicy, SelectedSocialPost } from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyPost } from '../domain/bluesky';
import { shortlistBlueskyPosts } from './bluesky-shortlist';
import type { SocialSelectionServices } from './editorial-selection';

// Supplements existing edition picks without displacing them.
export async function editBlueskyPosts(
  services: SocialSelectionServices,
  topic: TriageTopic,
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  runId: string,
  alreadySelected: SelectedSocialPost[] = [],
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
  const empty = (
    status: 'incomplete' | 'unavailable' | 'complete',
    failures?: string[],
  ) => ({
    status,
    failures,
    posts: [],
    model: null,
    candidatesShortlisted: shortlist.posts.length,
  });
  if (shortlist.status === 'incomplete')
    return empty('incomplete', shortlist.failures);
  if (!shortlist.posts.length) return empty('complete');
  const args: Parameters<SocialSelectionServices['socialEditor']['edit']> = [
    topic,
    shortlist.posts.map(({ post, score }) => ({
      id: score.id,
      platform: 'bluesky',
      text: post.text,
      author: post.author,
      publishedAt: post.publishedAt,
      relevance: score.relevance,
      interestingness: score.importance,
      engagementEvidence: `Bluesky API observation at ${post.observedAt}: likes ${post.metrics.likes}, reposts ${post.metrics.reposts}, replies ${post.metrics.replies}. Single snapshot; measured growth and account-relative reach unknown.`,
    })),
    budget,
    runId,
    alreadySelected.map(({ platform, text, author }) => ({
      platform,
      text,
      author,
    })),
  ];
  const outcome = services.socialEditor.editOutcome
    ? await services.socialEditor.editOutcome(...args)
    : null;
  const edited = outcome
    ? outcome.status === 'complete'
      ? outcome.value
      : null
    : await services.socialEditor.edit(...args);
  if (!edited)
    return empty(
      'unavailable',
      outcome?.status === 'failed' ? outcome.failures : undefined,
    );
  if (
    edited.posts.length > budget ||
    new Set(edited.posts.map((p) => p.id)).size !== edited.posts.length ||
    edited.posts.some((p) => !shortlist.posts.some((c) => c.score.id === p.id))
  )
    return empty('incomplete');
  return {
    status: 'complete' as const,
    model: edited.model,
    candidatesShortlisted: shortlist.posts.length,
    posts: edited.posts.map((selection) => ({
      ...shortlist.posts.find((c) => c.score.id === selection.id)!,
      whyItMatters: selection.whyItMatters,
      editorialRationale: selection.rationale,
    })),
  };
}
