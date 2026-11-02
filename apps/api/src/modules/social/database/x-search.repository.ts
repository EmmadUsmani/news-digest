import type { Pool } from 'pg';

import type { DiscoveredLink } from '../domain/collection.port';
import type { XSearchRepository } from '../domain/x-search.port';

export class PostgresXSearchRepository implements XSearchRepository {
  constructor(readonly db: Pool) {}
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
  async save(topicId: string, callId: string, links: DiscoveredLink[]) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Serialize first-search attribution across concurrent search saves.
      await client.query('SELECT pg_advisory_xact_lock(756284)');
      for (const link of links)
        await client.query(
          `INSERT INTO x_search_citations(call_id,topic_id,external_id,canonical_url,verification_url,new_candidate)
         VALUES($1,$2,$3,$4,$5,
           NOT EXISTS(SELECT 1 FROM social_posts WHERE platform='x' AND external_id=$3)
           AND NOT EXISTS(SELECT 1 FROM x_search_citations WHERE external_id=$3)) ON CONFLICT DO NOTHING`,
          [
            callId,
            topicId,
            link.externalId,
            link.url,
            link.verificationUrl ?? null,
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
