import {
  type DigestPreview,
  type RelevancePolicy,
  selectedBlueskyPostSchema,
  type SelectedSocialPost,
} from '@digest/contracts';
import type { PoolClient } from 'pg';

import type { TriageTopic } from '../../curation/public/editorial';
import { readBlueskyObservations } from '../database/bluesky.repository';
import type { BlueskyRepository } from '../domain/bluesky';
import { editBlueskyPosts } from './bluesky-editor';
import type { SocialSelectionServices } from './editorial-selection';

type BlueskySelectionEvidence = NonNullable<
  DigestPreview['topics'][number]['blueskySelection']
>;

// The protected Nov 3 run is acknowledged. Enable stored-post inclusion by
// default; an explicit non-1 value remains an operational off switch.
export function blueskyEditionsEnabled(
  value = process.env.BLUESKY_EDITIONS_ENABLED,
) {
  return value === undefined || value === '1';
}

// Explicit opt-in; STEERING 40 authorizes production activation after Nov 6 review.
export function blueskyReservedSlotEnabled(
  value = process.env.BLUESKY_RESERVED_SLOT_ENABLED,
) {
  return value === '1';
}

function availableSlots(input: {
  budget: number;
  selectedPosts: SelectedSocialPost[];
  reservedSlot?: boolean;
}) {
  const open = Math.max(0, input.budget - input.selectedPosts.length);
  return input.reservedSlot &&
    input.budget > 0 &&
    input.selectedPosts.some((post) => post.platform === 'x')
    ? Math.max(1, open)
    : open;
}

export function selectEditionBlueskyPosts(
  db: Pick<PoolClient, 'query'>,
  services: SocialSelectionServices | null,
  input: Omit<
    Parameters<typeof prepareBlueskyEditionPosts>[2],
    'enabled' | 'reservedSlot'
  >,
) {
  const reservedSlot = blueskyReservedSlotEnabled();
  if (!services)
    return Promise.resolve({
      status: blueskyEditionsEnabled()
        ? ('unavailable' as const)
        : ('disabled' as const),
      posts: structuredClone(input.selectedPosts),
      model: null,
      evidence: {
        openSlots: availableSlots({ ...input, reservedSlot }),
        ...(reservedSlot ? { reservedSlot: true } : {}),
        candidatesRead: 0,
        candidatesShortlisted: 0,
        postsPicked: 0,
        result: !blueskyEditionsEnabled()
          ? 'switched-off'
          : availableSlots({ ...input, reservedSlot }) === 0
            ? 'no-slot'
            : 'ai-unavailable',
      } satisfies BlueskySelectionEvidence,
    });
  return prepareBlueskyEditionPosts(
    { observations: (...args) => readBlueskyObservations(db, ...args) },
    services,
    { ...input, enabled: blueskyEditionsEnabled(), reservedSlot },
  );
}
export async function prepareBlueskyEditionPosts(
  repository: Pick<BlueskyRepository, 'observations'>,
  services: SocialSelectionServices,
  input: {
    enabled?: boolean;
    reservedSlot?: boolean;
    topic: TriageTopic;
    policy: RelevancePolicy;
    start: Date;
    end: Date;
    budget: number;
    selectedPosts: SelectedSocialPost[];
    runId: string;
  },
): Promise<{
  status: 'disabled' | 'complete' | 'incomplete' | 'unavailable';
  posts: SelectedSocialPost[];
  model: string | null;
  evidence: BlueskySelectionEvidence;
}> {
  const evidence: BlueskySelectionEvidence = {
    openSlots: availableSlots(input),
    ...(input.reservedSlot ? { reservedSlot: true } : {}),
    candidatesRead: 0,
    candidatesShortlisted: 0,
    postsPicked: 0,
    result: 'switched-off',
  };
  const unchanged = (
    status: 'disabled' | 'complete' | 'incomplete' | 'unavailable',
    result: BlueskySelectionEvidence['result'],
  ) => ({
    status,
    evidence: { ...evidence, result },
    posts: structuredClone(input.selectedPosts),
    model: null,
  });
  if (input.enabled !== true) return unchanged('disabled', 'switched-off');
  if (!Number.isInteger(input.budget) || input.budget < 0 || input.budget > 20)
    throw new Error('Expected social edition budget 0–20');
  if (
    !Number.isFinite(input.start.getTime()) ||
    !Number.isFinite(input.end.getTime()) ||
    input.start >= input.end
  )
    throw new Error('Invalid social coverage window');
  // A held slot is only consumed after a distinct Bluesky pick succeeds.
  const remaining = availableSlots(input);
  if (!remaining) return unchanged('complete', 'no-slot');
  const existing = new Set(
    input.selectedPosts
      .filter((p) => p.platform === 'bluesky')
      .map((p) => p.externalId),
  );
  const observations = await repository.observations(
    input.topic.id,
    input.start,
    input.end,
    input.end,
  );
  evidence.candidatesRead = observations.length;
  const candidates = observations.filter(
    (post) =>
      !existing.has(post.externalId) &&
      selectedBlueskyPostSchema.safeParse({
        ...post,
        displayText: post.displayText ?? post.text,
        reasons: [],
      }).success,
  );
  const edited = await editBlueskyPosts(
    services,
    input.topic,
    candidates,
    input.policy,
    input.start,
    input.end,
    remaining,
    input.runId,
    input.selectedPosts,
  );
  evidence.candidatesShortlisted = edited.candidatesShortlisted;
  if ('droppedPosts' in edited && edited.droppedPosts)
    evidence.droppedPosts = edited.droppedPosts;
  if (edited.status !== 'complete')
    return unchanged(
      edited.status,
      edited.failures?.length
        ? edited.failures.every(
            (failure) =>
              failure === 'budget-refused' ||
              failure === 'provider-spend-limit',
          )
          ? 'budget-refused'
          : edited.failures.every((failure) => failure === 'unavailable')
            ? 'ai-unavailable'
            : 'ai-editing-failed'
        : edited.status === 'unavailable'
          ? 'ai-unavailable'
          : 'ai-editing-failed',
    );
  const additions = edited.posts.map(
    ({ post, reasons, whyItMatters, editorialRationale }) =>
      selectedBlueskyPostSchema.parse({
        ...post,
        displayText: post.displayText ?? post.text,
        reasons: [...reasons, `Editor: ${editorialRationale}`],
        whyItMatters,
      }),
  );
  const retained = structuredClone(input.selectedPosts);
  if (additions.length && retained.length + additions.length > input.budget) {
    // editTopicPosts preserves the editor response order through preferX.
    const lastX = retained.map((post) => post.platform).lastIndexOf('x');
    if (input.reservedSlot && lastX >= 0)
      evidence.replacedXPostId = retained.splice(lastX, 1)[0].externalId;
  }
  return {
    status: 'complete',
    posts: [...retained, ...additions],
    model: edited.model,
    evidence: {
      ...evidence,
      postsPicked: additions.length,
      result: additions.length
        ? 'picks-made'
        : !candidates.length
          ? 'no-candidates'
          : !edited.candidatesShortlisted
            ? 'nothing-passed-triage'
            : 'editor-chose-none',
    },
  };
}
