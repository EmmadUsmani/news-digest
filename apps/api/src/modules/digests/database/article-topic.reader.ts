import { and, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { topics } from '../../../libs/db/schema';
import type { ArticleTriageSettings } from '../domain/article-triage-input';

// Both read-only article consumers reuse their caller's connection/transaction.
export async function readReactionTopic(
  client: Pick<PoolClient, 'query'>,
  topicId: string,
) {
  const [topic] = await drizzle(client as PoolClient)
    .select({ relevance_policy: topics.relevancePolicy })
    .from(topics)
    .where(
      and(
        eq(topics.id, topicId),
        eq(topics.enabled, true),
        gt(topics.postBudget, 0),
      ),
    );
  return topic;
}

export async function readIncrementalTriageTopic(
  client: Pick<PoolClient, 'query'>,
  topicId: string,
): Promise<ArticleTriageSettings | undefined> {
  const [topic] = await drizzle(client as PoolClient)
    .select({
      id: topics.id,
      name: topics.name,
      description: topics.description,
      include_guidance: topics.includeGuidance,
      exclude_guidance: topics.excludeGuidance,
      relevance_policy: topics.relevancePolicy,
    })
    .from(topics)
    .where(
      and(
        eq(topics.id, topicId),
        eq(topics.enabled, true),
        gt(topics.storyBudget, 0),
      ),
    );
  return topic;
}
