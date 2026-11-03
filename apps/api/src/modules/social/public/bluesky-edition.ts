import {
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

// The protected Nov 3 run is acknowledged. Enable stored-post inclusion by
// default; an explicit non-1 value remains an operational off switch.
export function blueskyEditionsEnabled(
  value = process.env.BLUESKY_EDITIONS_ENABLED,
) {
  return value === undefined || value === '1';
}

export function selectEditionBlueskyPosts(
  db: Pick<PoolClient, 'query'>,
  services: SocialSelectionServices | null,
  input: Omit<Parameters<typeof prepareBlueskyEditionPosts>[2], 'enabled'>,
) {
  if (!services)
    return Promise.resolve({
      status: blueskyEditionsEnabled()
        ? ('unavailable' as const)
        : ('disabled' as const),
      posts: structuredClone(input.selectedPosts),
      model: null,
    });
  return prepareBlueskyEditionPosts(
    { observations: (...args) => readBlueskyObservations(db, ...args) },
    services,
    { ...input, enabled: blueskyEditionsEnabled() },
  );
}
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
