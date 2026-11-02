import type { RelevancePolicy } from '@digest/contracts';

import { assessPostEligibility } from './eligibility';
import type { RedditPost } from './reddit';

export interface RedditObservation {
  post: RedditPost;
  observedAt: string;
  citesX: boolean;
}
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
function rate(entry: RedditObservation) {
  const ageHours =
    (Date.parse(entry.observedAt) - Date.parse(entry.post.publishedAt)) /
    3600000;
  if (
    !Number.isFinite(ageHours) ||
    ageHours < 0 ||
    !Number.isFinite(entry.post.metrics.score) ||
    !Number.isFinite(entry.post.metrics.comments) ||
    !Number.isFinite(entry.post.metrics.upvoteRatio) ||
    entry.post.metrics.comments < 0 ||
    entry.post.metrics.upvoteRatio < 0 ||
    entry.post.metrics.upvoteRatio > 1
  )
    return null;
  // One snapshot supplies lifetime score/hour, not measured change over time.
  return Math.max(0, entry.post.metrics.score) / Math.max(1, ageHours);
}

// Returns a separate Reddit shortlist. Publication must reserve X preference
// and run editorial selection before combining platforms; this never pads slots.
export function rankRedditPosts(
  observations: RedditObservation[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
) {
  if (
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start >= end
  )
    throw new Error('Invalid social coverage window');
  if (!Number.isInteger(budget) || budget <= 0) return [];
  const unique = [
    ...new Map(observations.map((o) => [o.post.externalId, o])).values(),
  ];
  const baselineStart = start.getTime() - 7 * 86400000;
  const baselines = new Map<string, { score: number; rate: number }[]>();
  for (const entry of unique) {
    const published = Date.parse(entry.post.publishedAt);
    const observed = Date.parse(entry.observedAt);
    const velocity = rate(entry);
    if (
      published < baselineStart ||
      published >= start.getTime() ||
      !Number.isFinite(published) ||
      observed >= start.getTime() ||
      velocity === null
    )
      continue;
    const community = entry.post.subreddit.toLowerCase();
    const samples = baselines.get(community) ?? [];
    samples.push({
      score: Math.max(0, entry.post.metrics.score),
      rate: velocity,
    });
    baselines.set(community, samples);
  }
  return unique
    .flatMap((entry) => {
      const { post } = entry;
      const velocity = rate(entry);
      const baseline = baselines.get(post.subreddit.toLowerCase());
      if (
        entry.citesX ||
        velocity === null ||
        Date.parse(entry.observedAt) >= end.getTime() ||
        !baseline ||
        baseline.length < 5 ||
        !assessPostEligibility(
          {
            text: `${post.title}\n${post.text}`,
            publishedAt: post.publishedAt,
          },
          policy,
          start,
          end,
        ).eligible
      )
        return [];
      const scoreRatio =
        post.metrics.score / Math.max(1, median(baseline.map((b) => b.score)));
      const rateRatio =
        velocity / Math.max(1, median(baseline.map((b) => b.rate)));
      if (
        post.metrics.score < 10 ||
        post.metrics.upvoteRatio < 0.7 ||
        scoreRatio < 2 ||
        rateRatio < 2
      )
        return [];
      return [
        {
          post,
          observedAt: entry.observedAt,
          strength: Math.sqrt(scoreRatio * rateRatio),
          reasons: [
            `Score ${scoreRatio.toFixed(1)}× and lifetime score/hour ${rateRatio.toFixed(1)}× the prior seven-day r/${post.subreddit} median (${baseline.length} posts).`,
            'Listing-sample comparison only; lifetime score/hour is a velocity proxy, not measured engagement growth.',
          ],
        },
      ];
    })
    .sort(
      (a, b) =>
        b.strength - a.strength ||
        b.post.metrics.score - a.post.metrics.score ||
        a.post.externalId.localeCompare(b.post.externalId),
    )
    .slice(0, Math.min(budget, 200));
}
