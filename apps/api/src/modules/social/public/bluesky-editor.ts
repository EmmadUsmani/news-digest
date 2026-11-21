import type {
  DigestPreview,
  RelevancePolicy,
  SelectedSocialPost,
} from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyPost } from '../domain/bluesky';
import { blueskyMediaEvidence } from '../domain/bluesky-media-evidence';
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
  coveredStories: {
    title: string;
    summary: string;
    textTruncated?: boolean;
  }[] = [],
  options: { previewEventBudget?: boolean } = {},
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
  return editShortlistedBlueskyPosts(
    services.socialEditor,
    topic,
    shortlist,
    budget,
    runId,
    alreadySelected,
    coveredStories,
    options,
  );
}

// Final selection depends on available slots and existing picks; scoring does not.
// Callers must retain admission protection before starting either paid stage.
export async function editShortlistedBlueskyPosts(
  editor: SocialSelectionServices['socialEditor'],
  topic: TriageTopic,
  shortlist: Awaited<ReturnType<typeof shortlistBlueskyPosts>>,
  budget: number,
  runId: string,
  alreadySelected: SelectedSocialPost[] = [],
  coveredStories: {
    title: string;
    summary: string;
    textTruncated?: boolean;
  }[] = [],
  options: { previewEventBudget?: boolean } = {},
) {
  if (!Number.isInteger(budget) || budget < 0 || budget > 20)
    throw new Error('Expected Bluesky editorial budget 0–20');
  const previewState = options.previewEventBudget
    ? {
        eventBudgetPreview: null as
          | null
          | ((typeof shortlist.posts)[number] & {
              whyItMatters: string;
              editorialRationale: string;
            })[],
      }
    : {};
  const empty = (
    status: 'incomplete' | 'unavailable' | 'complete',
    failures?: string[],
    droppedPosts?: NonNullable<
      NonNullable<
        DigestPreview['topics'][number]['blueskySelection']
      >['droppedPosts']
    >,
  ) => ({
    ...previewState,
    status,
    failures,
    droppedPosts,
    posts: [],
    model: null,
    candidatesShortlisted: shortlist.posts.length,
  });
  if (!budget) return empty('complete');
  if (shortlist.status === 'incomplete')
    return empty('incomplete', shortlist.failures);
  if (!shortlist.posts.length) return empty('complete');
  const args: Parameters<SocialSelectionServices['socialEditor']['edit']> = [
    topic,
    blueskyEditorialCandidates(shortlist),
    budget,
    runId,
    alreadySelected.map(({ platform, text, author }) => ({
      platform,
      text,
      author,
    })),
    coveredStories,
  ];
  const outcome = editor.editOutcome
    ? await editor.editOutcome(
        ...args,
        ...(options.previewEventBudget
          ? [{ reviewEvents: true, completeStoryEvidence: true }]
          : []),
      )
    : null;
  const edited = outcome
    ? outcome.status === 'complete'
      ? outcome.value
      : null
    : await editor.edit(...args);
  if (!edited)
    return empty(
      'unavailable',
      outcome?.status === 'failed' ? outcome.failures : undefined,
      outcome?.status === 'failed' ? outcome.droppedPosts : undefined,
    );
  if (
    edited.posts.length > budget ||
    new Set(edited.posts.map((p) => p.id)).size !== edited.posts.length ||
    edited.posts.some((p) => !shortlist.posts.some((c) => c.score.id === p.id))
  )
    return empty('incomplete');
  const materialize = (selection: typeof edited.posts) =>
    selection.map((item) => ({
      ...shortlist.posts.find((candidate) => candidate.score.id === item.id)!,
      whyItMatters: item.whyItMatters,
      editorialRationale: item.rationale,
    }));
  const preview = edited.eventBudgetPreview;
  // Existing platform picks have no stable review IDs in this editor request.
  // Their event/fact preservation cannot be established by this preview.
  if (
    options.previewEventBudget &&
    alreadySelected.length === 0 &&
    preview &&
    preview.length <= budget &&
    new Set(preview.map(({ id }) => id)).size === preview.length &&
    preview.every(({ id }) =>
      shortlist.posts.some((item) => item.score.id === id),
    )
  )
    previewState.eventBudgetPreview = materialize(preview);
  return {
    ...previewState,
    status: 'complete' as const,
    model: edited.model,
    droppedPosts: edited.droppedPosts,
    candidatesShortlisted: shortlist.posts.length,
    posts: materialize(edited.posts),
  };
}

// Shared by the ordinary platform editor and the joint event review.
export function blueskyEditorialCandidates(
  shortlist: Awaited<ReturnType<typeof shortlistBlueskyPosts>>,
) {
  return shortlist.posts.map(({ post, score, growthEvidence }) => ({
    id: score.id,
    platform: 'bluesky' as const,
    text: post.text,
    author: post.author,
    publishedAt: post.publishedAt,
    relevance: score.relevance,
    interestingness: score.importance,
    engagementEvidence: `Bluesky API observation at ${post.observedAt}: likes ${post.metrics.likes}, reposts ${post.metrics.reposts}, replies ${post.metrics.replies}. ${growthEvidence ?? 'Measured growth and account-relative reach unknown.'} ${blueskyMediaEvidence(post)}`,
  }));
}
