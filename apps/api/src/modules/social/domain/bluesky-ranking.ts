import type { RelevancePolicy } from '@digest/contracts';

import type { BlueskyPost } from './bluesky';
import { assessPostEligibility, assessPostSafety } from './eligibility';

// Preparation only: no edition caller. X preference and editorial selection
// must be preserved when this platform's shortlist is eventually published.
export function rankBlueskyPosts(
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
) {
  return rankObservations(
    posts,
    policy,
    start,
    end,
    budget,
    assessPostEligibility,
  );
}

// Semantic preparation still applies all safety/window/snapshot gates, but
// leaves positive relevance to triage. Never used by production editions.
export function rankSafeBlueskyPosts(
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
) {
  return rankObservations(posts, policy, start, end, budget, assessPostSafety);
}

function rankObservations(
  posts: BlueskyPost[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  assess: typeof assessPostEligibility,
) {
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Invalid social coverage window');
  if (!Number.isInteger(budget) || budget <= 0) return [];
  // Pick the latest valid snapshot available by the cutoff, independently of
  // input order. Never combine counts from different observations.
  const latest = new Map<string, BlueskyPost>();
  const observations = new Map<string, BlueskyPost[]>();
  for (const post of posts) {
    const observed = Date.parse(post.observedAt);
    const published = Date.parse(post.publishedAt);
    if (
      !Number.isFinite(observed) ||
      !Number.isFinite(published) ||
      observed < published ||
      observed > end.getTime() ||
      Object.values(post.metrics).some((n) => !Number.isSafeInteger(n) || n < 0)
    )
      continue;
    const history = observations.get(post.externalId) ?? [];
    history.push(post);
    observations.set(post.externalId, history);
    const previous = latest.get(post.externalId);
    if (
      !previous ||
      observed > Date.parse(previous.observedAt) ||
      (observed === Date.parse(previous.observedAt) &&
        JSON.stringify(post) < JSON.stringify(previous))
    )
      latest.set(post.externalId, post);
  }
  return [...latest.values()]
    .flatMap((post) => {
      const relevance = assess(post, policy, start, end);
      if (!relevance.eligible) return [];
      const engagement =
        post.metrics.likes + 2 * post.metrics.reposts + post.metrics.replies;
      if (engagement === 0) return [];
      const ageHours = Math.max(
        1,
        (Date.parse(post.observedAt) - Date.parse(post.publishedAt)) / 3600000,
      );
      const lifetimeRate = engagement / ageHours;
      const strength =
        Math.log10(1 + engagement) + Math.log10(1 + lifetimeRate);
      return [
        {
          post,
          growthEvidence: observedCountChanges(
            post,
            observations.get(post.externalId) ?? [],
          ),
          strength,
          lifetimeRate,
          reasons: [
            relevance.reason.replace(
              'Verified post topic phrase:',
              'Topic phrase:',
            ),
            `Official Bluesky API counts observed ${post.observedAt}: likes ${post.metrics.likes}, reposts ${post.metrics.reposts}, replies ${post.metrics.replies}.`,
            `Lifetime weighted engagement/hour ${lifetimeRate.toFixed(1)} is an age proxy, not measured growth or account-relative reach.`,
          ],
        },
      ];
    })
    .sort(
      (a, b) =>
        b.strength - a.strength ||
        a.post.externalId.localeCompare(b.post.externalId),
    )
    .slice(0, Math.min(200, budget));
}

// Report count changes, including decreases, without inferring reach or causes.
function observedCountChanges(
  latest: BlueskyPost,
  observations: BlueskyPost[],
) {
  const earlier = observations
    .filter(
      (post) =>
        post.publishedAt === latest.publishedAt &&
        post.author === latest.author &&
        Date.parse(post.observedAt) < Date.parse(latest.observedAt),
    )
    .sort(
      (a, b) =>
        Date.parse(a.observedAt) - Date.parse(b.observedAt) ||
        JSON.stringify(a).localeCompare(JSON.stringify(b)),
    )[0];
  if (!earlier)
    return 'Measured growth unknown: only one distinct valid observation time.';
  for (const endpoint of [earlier, latest]) {
    if (
      observations.some(
        (post) =>
          post.publishedAt === latest.publishedAt &&
          post.author === latest.author &&
          Date.parse(post.observedAt) === Date.parse(endpoint.observedAt) &&
          (post.metrics.likes !== endpoint.metrics.likes ||
            post.metrics.reposts !== endpoint.metrics.reposts ||
            post.metrics.replies !== endpoint.metrics.replies),
      )
    )
      return 'Measured growth unknown: conflicting counts at an observation time.';
  }
  const changes = {
    likes: latest.metrics.likes - earlier.metrics.likes,
    reposts: latest.metrics.reposts - earlier.metrics.reposts,
    replies: latest.metrics.replies - earlier.metrics.replies,
  };
  return `Official API count changes from ${earlier.observedAt} to ${latest.observedAt}: ${JSON.stringify(changes)}. Net snapshot differences, not gross activity; account-relative reach unknown.`;
}
