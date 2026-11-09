import {
  scheduleSchema,
  sourceCatalogSchema,
  topicSchema,
} from '@digest/contracts';
import { ServiceUnavailableException } from '@nestjs/common';

import { publicFeedUrl } from '../libs/ports/public-url';

// Phase 4 preparation only. Transports remain unregistered in the live application.
// Pick fields explicitly: neither legacy ownership nor future DB columns may
// become public simply because a repository starts returning them.
const publicScheduleSchema = scheduleSchema
  .pick({
    cadence: true,
    timezone: true,
    coverageWindow: true,
    storyBudget: true,
    postBudget: true,
  })
  .strip();
const publicTopicSchema = topicSchema.pick({
  id: true,
  name: true,
  description: true,
  includeGuidance: true,
  excludeGuidance: true,
  enabled: true,
  position: true,
  storyBudget: true,
  postBudget: true,
  relevancePolicy: true,
  sources: true,
  queries: true,
  accounts: true,
  redditCommunities: true,
  blueskyQuery: true,
  xDiscovery: true,
});

export async function readPublicSchedule(read: () => Promise<unknown>) {
  try {
    // The future caller must supply system schedule settings, never a profile.
    return publicScheduleSchema.parse(await read());
  } catch {
    throw new ServiceUnavailableException('Schedule settings unavailable');
  }
}

export async function readPublicTopics(read: () => Promise<unknown>) {
  try {
    return publicTopicSchema.array().parse(await read());
  } catch {
    throw new ServiceUnavailableException('Topic settings unavailable');
  }
}

// Feed paths and query parameters can contain private subscription tokens.
// Public browsing needs the publisher origin, not the configured fetch URL.
export async function readPublicSourceCatalog(read: () => Promise<unknown>) {
  try {
    return sourceCatalogSchema.parse(await read()).map(({ id, name, url }) => ({
      id,
      name,
      origin: new URL(publicFeedUrl(url)).origin,
    }));
  } catch {
    throw new ServiceUnavailableException('Source catalog unavailable');
  }
}
