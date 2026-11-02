import type { Pool } from 'pg';

import type { DiscoveredLink } from '../domain/collection.port';
import type { ScheduledSearchTopic } from '../domain/scheduled-search';
import type {
  XReportedEngagement,
  XSearchRepository,
} from '../domain/x-search.port';

export class PostgresXSearchRepository implements XSearchRepository {
  constructor(readonly db: Pool) {}
  async scheduledTopics(end: Date) {
    const { rows } = await this.db.query<ScheduledSearchTopic>(
      `WITH free_topics AS (
        SELECT c.external_id,t.topic_id FROM x_link_citations c
          JOIN topic_source_connections t ON t.source_id=c.source_id
        UNION SELECT c.external_id,s.topic_id FROM social_discovery_citations c
          JOIN social_discovery_sources s ON s.id=c.source_id
      )
      SELECT t.id,t.name,t.include_guidance AS guidance,t.accounts AS handles,
        (SELECT count(*)::int FROM free_topics f JOIN social_posts p
          ON p.platform='x' AND p.external_id=f.external_id
          WHERE f.topic_id=t.id AND p.published_at >= $1::timestamptz - interval '24 hours'
            AND p.published_at < $1::timestamptz) AS "freePosts"
      FROM topics t WHERE t.enabled AND t.post_budget > 0 ORDER BY t.position,t.id`,
      [end],
    );
    return rows;
  }
  async verificationCandidates(callId: string): Promise<string[]> {
    const { rows } = await this.db.query<{ external_id: string }>(
      `SELECT c.external_id FROM x_search_citations c
       JOIN topics t ON t.id=c.topic_id AND t.enabled AND t.post_budget > 0
       LEFT JOIN social_posts p ON p.platform='x' AND p.external_id=c.external_id
       LEFT JOIN x_embed_checks v ON v.external_id=c.external_id
       WHERE c.call_id=$1 AND p.external_id IS NULL
         AND (v.checked_at IS NULL OR v.checked_at < now() - interval '1 day')
       ORDER BY length(c.external_id) DESC,c.external_id DESC LIMIT 10`,
      [callId],
    );
    return rows.map((row) => row.external_id);
  }
  async topic(id: string) {
    const { rows } = await this.db.query<{
      id: string;
      name: string;
      guidance: string;
      handles: string[];
    }>(
      `SELECT id,name,include_guidance AS guidance,accounts AS handles
        FROM topics WHERE id=$1 AND enabled AND post_budget > 0`,
      [id],
    );
    return rows[0];
  }
  async save(
    topicId: string,
    callId: string,
    links: DiscoveredLink[],
    reportedEngagement: XReportedEngagement[] = [],
  ) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Serialize first-search attribution across concurrent search saves.
      await client.query('SELECT pg_advisory_xact_lock(756284)');
      for (const link of links)
        await client.query(
          `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url,verification_url,new_candidate,reported_engagement)
         VALUES($1,$2,$3,$4,$5,
           NOT EXISTS(SELECT 1 FROM social_posts WHERE platform='x' AND external_id=$3)
           AND NOT EXISTS(SELECT 1 FROM x_search_citations WHERE external_id=$3),$6) ON CONFLICT DO NOTHING`,
          [
            callId,
            topicId,
            link.externalId,
            link.url,
            link.verificationUrl ?? null,
            // Citation-bound reports stay separate from officially verified posts.
            reportedEngagement.find(
              (report) => report.externalId === link.externalId,
            ) ?? null,
          ],
        );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
