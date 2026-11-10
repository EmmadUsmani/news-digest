import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  topics,
  topicSourceConnections as connections,
  xSearchTopicSettings,
} from '../../../libs/db/schema';
import { readPublicTopics } from '../../../public-read/settings';

// The caller owns the pool; this reader
// always uses the system catalog, independently of legacy ownership flags.
export class PublicTopicsReader {
  constructor(private readonly pool: Pool) {}

  read() {
    return readPublicTopics(async () => {
      const db = drizzle(this.pool);
      const sourceList = db
        .select({
          // Ordered aggregation keeps the catalog's stable source ordering.
          value: sql<
            string[]
          >`coalesce(jsonb_agg(${connections.sourceId} order by ${connections.sourceId}), '[]'::jsonb)`,
        })
        .from(connections)
        .where(eq(connections.topicId, topics.id));
      return db
        .select({
          id: topics.id,
          name: topics.name,
          description: topics.description,
          includeGuidance: topics.includeGuidance,
          excludeGuidance: topics.excludeGuidance,
          enabled: topics.enabled,
          position: topics.position,
          storyBudget: topics.storyBudget,
          postBudget: topics.postBudget,
          relevancePolicy: topics.relevancePolicy,
          sources: sql<string[]>`(${sourceList})`,
          queries: topics.queries,
          accounts: topics.accounts,
          redditCommunities: topics.redditCommunities,
          blueskyQuery: topics.blueskyQuery,
          xDiscovery: {
            minimumLikes: xSearchTopicSettings.trendingMinFaves,
            exclusions: xSearchTopicSettings.exclusions,
          },
        })
        .from(topics)
        .leftJoin(
          xSearchTopicSettings,
          eq(xSearchTopicSettings.topicId, topics.id),
        )
        .orderBy(topics.position, topics.id);
    });
  }
}
