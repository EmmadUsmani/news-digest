import type { SelectedSocialPost } from '@digest/contracts';

import type {
  SocialEditorialCandidate,
  TriageTopic,
} from '../../curation/public/editorial';
import type { SocialSelectionServices } from './editorial-selection';

// Evaluation only. Callers supply one bounded, already-qualified shortlist
// across platforms, not independent reviews with incompatible event IDs.
// No scheduled caller opts in before saved-edition acceptance.
export async function previewJointEventSelection<T extends SelectedSocialPost>(
  editor: SocialSelectionServices['socialEditor'],
  input: {
    topic: TriageTopic;
    candidates: { editorial: SocialEditorialCandidate; snapshot: T }[];
    stories: { title: string; summary: string; textTruncated?: boolean }[];
    budget: number;
    runId: string;
  },
) {
  const { candidates, stories, budget } = input;
  const id = (post: SelectedSocialPost) =>
    post.platform === 'x'
      ? post.externalId
      : `${post.platform}:${post.externalId}`;
  if (
    !Number.isInteger(budget) ||
    budget < 0 ||
    budget > 20 ||
    candidates.length > 10 ||
    stories.length > 10 ||
    new Set(candidates.map(({ editorial }) => editorial.id)).size !==
      candidates.length ||
    candidates.some(
      ({ editorial, snapshot }) =>
        editorial.id !== id(snapshot) ||
        !snapshot.externalId.trim() ||
        editorial.platform !== snapshot.platform ||
        editorial.text !== snapshot.text ||
        editorial.author !== snapshot.author ||
        editorial.publishedAt !== snapshot.publishedAt ||
        !Number.isInteger(editorial.relevance) ||
        editorial.relevance < 6 ||
        editorial.relevance > 10 ||
        !Number.isInteger(editorial.interestingness) ||
        editorial.interestingness < 4 ||
        editorial.interestingness > 10,
    )
  )
    throw new Error('Expected a bounded, qualified cross-platform shortlist');
  if (!budget || !candidates.length)
    return { status: 'complete' as const, posts: [], eventBudgetPreview: [] };
  if (!editor.editOutcome)
    return {
      status: 'unavailable' as const,
      posts: [],
      eventBudgetPreview: null,
    };
  const outcome = await editor.editOutcome(
    input.topic,
    candidates.map(({ editorial }) => editorial),
    budget,
    input.runId,
    [],
    stories,
    { reviewEvents: true, completeStoryEvidence: true },
  );
  if (outcome.status !== 'complete')
    return {
      status: 'unavailable' as const,
      posts: [],
      eventBudgetPreview: null,
    };
  const { value } = outcome;
  const valid = (picks: typeof value.posts) =>
    picks.length <= budget &&
    new Set(picks.map(({ id }) => id)).size === picks.length &&
    picks.every((pick) =>
      candidates.some(({ editorial }) => editorial.id === pick.id),
    );
  if (!valid(value.posts))
    return {
      status: 'invalid-selection' as const,
      posts: [],
      eventBudgetPreview: null,
    };
  // Preserve the existing X preference. Refuse rather than silently dropping
  // a planned event/fact to fit the non-X allowance after joint planning.
  const nonXLimit =
    budget -
    Math.min(
      candidates.filter(({ editorial }) => editorial.platform === 'x').length,
      Math.ceil(budget * 0.7),
    );
  const respectsPreference = (picks: typeof value.posts) =>
    picks.filter(
      (pick) =>
        candidates.find(({ editorial }) => editorial.id === pick.id)!.snapshot
          .platform !== 'x',
    ).length <= nonXLimit;
  const materialize = (picks: typeof value.posts) =>
    picks.map((pick) => ({
      ...candidates.find(({ editorial }) => editorial.id === pick.id)!.snapshot,
      whyItMatters: pick.whyItMatters,
      reasons: [
        ...candidates.find(({ editorial }) => editorial.id === pick.id)!
          .snapshot.reasons,
        `Editor: ${pick.rationale}`,
      ],
    }));
  const preview = value.eventBudgetPreview;
  return {
    status: 'complete' as const,
    posts: materialize(value.posts),
    eventBudgetPreview:
      preview &&
      valid(preview) &&
      respectsPreference(value.posts) &&
      respectsPreference(preview)
        ? materialize(preview)
        : null,
  };
}
