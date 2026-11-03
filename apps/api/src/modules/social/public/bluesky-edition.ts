import {
  type RelevancePolicy,
  selectedBlueskyPostSchema,
  type SelectedSocialPost,
} from '@digest/contracts';

import type { TriageTopic } from '../../curation/public/editorial';
import type { BlueskyRepository } from '../domain/bluesky';
import { editBlueskyPosts } from './bluesky-editor';
import type { SocialSelectionServices } from './editorial-selection';

// Explicit preparation seam, with no production caller. The gate must be
// deliberately enabled by a future publisher after the scheduled-run ack.
export async function prepareBlueskyEditionPosts(
  repository: Pick<BlueskyRepository, 'observations'>,
  services: SocialSelectionServices,
  input: {
    enabled?: boolean;
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
}> {
  const unchanged = (
    status: 'disabled' | 'complete' | 'incomplete' | 'unavailable',
  ) => ({
    status,
    posts: structuredClone(input.selectedPosts),
    model: null,
  });
  if (input.enabled !== true) return unchanged('disabled');
  if (!Number.isInteger(input.budget) || input.budget < 0 || input.budget > 20)
    throw new Error('Expected social edition budget 0–20');
  if (
    !Number.isFinite(input.start.getTime()) ||
    !Number.isFinite(input.end.getTime()) ||
    input.start >= input.end
  )
    throw new Error('Invalid social coverage window');
  // Keep all existing editorial picks, especially X. Never expand the topic
  // budget or displace an X pick to make room for the secondary platform.
  const remaining = Math.max(0, input.budget - input.selectedPosts.length);
  if (!remaining) return unchanged('complete');
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
  const candidates = observations.filter(
    (post) =>
      !existing.has(post.externalId) &&
      selectedBlueskyPostSchema.safeParse({
        ...post,
        displayText: post.text,
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
  );
  if (edited.status !== 'complete') return unchanged(edited.status);
  const additions = edited.posts.map(
    ({ post, reasons, whyItMatters, editorialRationale }) =>
      selectedBlueskyPostSchema.parse({
        ...post,
        displayText: post.text,
        reasons: [...reasons, `Editor: ${editorialRationale}`],
        whyItMatters,
      }),
  );
  return {
    status: 'complete',
    posts: [...structuredClone(input.selectedPosts), ...additions],
    model: edited.model,
  };
}
