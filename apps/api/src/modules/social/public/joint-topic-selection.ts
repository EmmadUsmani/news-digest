import type { RelevancePolicy, SelectedSocialPost } from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyPost } from '../domain/bluesky';
import { blueskyEditorialCandidates } from './bluesky-editor';
import { shortlistBlueskyPosts } from './bluesky-shortlist';
import {
  editTopicPosts,
  type SocialSelectionServices,
} from './editorial-selection';
import { shortlistEventCandidates } from './event-shortlist';
import { previewJointEventSelection } from './joint-event-editor';

// Evaluation only: qualify each platform using its normal gates, then spend
// at most one final editor call on a shared event/fact namespace.
export async function previewTopicEventSelection(
  services: SocialSelectionServices,
  input: {
    topic: TriageTopic;
    candidates: SelectedSocialPost[];
    blueskyPosts: BlueskyPost[];
    policy: RelevancePolicy;
    start: Date;
    end: Date;
    stories: { title: string; summary: string; textTruncated?: boolean }[];
    budget: number;
    runId: string;
  },
) {
  if (!Number.isInteger(input.budget) || input.budget < 0 || input.budget > 20)
    throw new Error('Expected joint editorial budget 0–20');
  if (input.candidates.some((post) => post.platform === 'bluesky'))
    throw new Error('Supply Bluesky observations separately');
  const unavailable = {
    status: 'unavailable' as const,
    posts: [],
    eventBudgetPreview: null,
  };
  if (!input.budget)
    return { status: 'complete' as const, posts: [], eventBudgetPreview: [] };
  const primary = await editTopicPosts(
    services,
    input.topic,
    input.candidates,
    [],
    input.budget,
    input.runId,
    input.stories,
    { prepareJointReview: true },
  );
  if (!primary.qualifiedCandidates) return unavailable;
  const bluesky = await shortlistBlueskyPosts(
    services.socialTriage,
    input.topic,
    input.blueskyPosts,
    input.policy,
    input.start,
    input.end,
    10,
    input.runId,
  );
  if (bluesky.status !== 'complete') return unavailable;
  const blueEditorial = blueskyEditorialCandidates(bluesky);
  const combined = [
    ...primary.qualifiedCandidates,
    ...bluesky.posts.map(({ post, score, reasons }) => ({
      editorial: blueEditorial.find((candidate) => candidate.id === score.id)!,
      snapshot: {
        ...post,
        displayText: post.displayText ?? post.text,
        reasons,
      } satisfies SelectedSocialPost,
    })),
  ];
  return previewJointEventSelection(services.socialEditor, {
    topic: input.topic,
    candidates: shortlistEventCandidates(
      combined,
      input.budget,
      (candidate) => ({
        ...candidate.editorial,
        platform: candidate.snapshot.platform,
      }),
    ),
    stories: input.stories,
    budget: input.budget,
    runId: input.runId,
  });
}
