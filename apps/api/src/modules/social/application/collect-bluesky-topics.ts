import type { Topic } from '@digest/contracts';

import type { BlueskyRepository, BlueskySearchPort } from '../domain/bluesky';
import { collectBluesky } from './collect-bluesky';

// One open query per enabled topic, at most four topics / 200 submissions.
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
) {
  const end = now();
  const start = new Date(end.getTime() - 86400000);
  const results = [];
  for (const topic of topics
    .filter((t) => t.enabled && t.postBudget > 0)
    .slice(0, 4)) {
    const query = (
      (topic.blueskyQuery?.trim() || topic.queries.find((q) => q.trim())) ??
      topic.relevancePolicy.includeAny[0] ??
      topic.name
    )
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
