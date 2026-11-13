import type { Topic } from '@digest/contracts';

import type { BlueskyRepository, BlueskySearchPort } from '../domain/bluesky';
import { collectBluesky } from './collect-bluesky';

// One open query per enabled topic, at most five topics / 250 submissions.
// Sequential execution shares authentication/backoff and stops on any failure.
export async function collectBlueskyTopics(
  repository: BlueskyRepository,
  search: BlueskySearchPort,
  topics: Pick<
    Topic,
    | 'id'
    | 'name'
    | 'enabled'
    | 'postBudget'
    | 'queries'
    | 'relevancePolicy'
    | 'blueskyQuery'
  >[],
  now: () => Date = () => new Date(),
  policy?: { worldTopicId: string },
) {
  const end = now();
  const start = new Date(end.getTime() - 86400000);
  const results = [];
  for (const topic of topics
    .filter((t) => t.enabled && t.postBudget > 0)
    .slice(0, 5)) {
    const fallback =
      topic.queries.find((q) => q.trim()) ??
      topic.relevancePolicy.includeAny[0] ??
      topic.name;
    // Opt-in by stable ID; no scheduler enables this policy yet. Capture the
    // slot from the shared window end so retries/restarts do not reset it.
    const slot = Math.floor(end.getTime() / 3600000) % 4;
    const rotated =
      policy?.worldTopicId === topic.id
        ? [fallback, 'Ukraine', fallback, 'Gaza'][slot]
        : fallback;
    const query = (topic.blueskyQuery?.trim() || rotated || fallback)
      .trim()
      .slice(0, 500);
    const result = await collectBluesky(
      repository,
      search,
      topic.id,
      query,
      start,
      end,
      now,
    );
    results.push({
      topicId: topic.id,
      query,
      fetched: result.fetched,
      submitted: result.submitted,
    });
  }
  return { status: 'complete', start, end, topics: results };
}
