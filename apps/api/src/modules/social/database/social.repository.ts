import { database } from '../../../libs/db/connections';
import type { SocialPost } from '../domain/posts';
import { xPostTime } from '../domain/x-post-time';

export class PostgresSocialRepository {
  readonly db = database();
  async topicPosts(topicId: string) {
    // Source association is discovery scope only; relevance must use post text.
    const result = await this.db.query<{
      externalId: string;
      publishedAt: Date | null;
      embedHtml: string;
    }>(
      `SELECT p.external_id AS "externalId",p.published_at AS "publishedAt",p.embed_html AS "embedHtml"
       FROM social_posts p WHERE p.platform='x' AND (
         EXISTS(SELECT 1 FROM x_link_citations c JOIN topic_source_connections t ON t.source_id=c.source_id
                WHERE c.external_id=p.external_id AND t.topic_id=$1)
         OR EXISTS(SELECT 1 FROM social_discovery_citations c JOIN social_discovery_sources s ON s.id=c.source_id
                   WHERE c.external_id=p.external_id AND s.topic_id=$1)
         OR EXISTS(SELECT 1 FROM x_search_citations c WHERE c.external_id=p.external_id AND c.topic_id=$1)
       ) ORDER BY p.published_at DESC NULLS LAST,p.external_id`,
      [topicId],
    );
    return result.rows;
  }
  async candidates(limit: number): Promise<string[]> {
    // Spend bounded checks across enabled topics before taking another from one.
    // Unverified discoveries precede refreshes; citation breadth is not independence.
    const result = await this.db.query<{ external_id: string }>(
      `WITH citations AS (
         SELECT c.external_id,c.source_id,c.last_seen_at,t.topic_id
         FROM x_link_citations c JOIN topic_source_connections t ON t.source_id=c.source_id
         UNION ALL
         SELECT c.external_id,'river:' || c.source_id,c.last_seen_at,s.topic_id
         FROM social_discovery_citations c JOIN social_discovery_sources s ON s.id=c.source_id
         UNION ALL
         SELECT c.external_id,'x-search',c.discovered_at,c.topic_id FROM x_search_citations c
       ), eligible AS (
         SELECT c.external_id,c.topic_id,
                CASE WHEN p.external_id IS NULL THEN 0 ELSE 1 END AS refresh,
                count(DISTINCT c.source_id) AS sources,max(c.last_seen_at) AS last_seen
         FROM citations c JOIN topics t ON t.id=c.topic_id AND t.enabled
         LEFT JOIN x_embed_checks v ON v.external_id=c.external_id
         LEFT JOIN social_posts p ON p.platform='x' AND p.external_id=c.external_id
         WHERE v.checked_at IS NULL OR v.checked_at < now() - interval '1 day'
         GROUP BY c.external_id,c.topic_id,p.external_id
       ), ranked AS (
         SELECT *,row_number() OVER (
           PARTITION BY refresh,topic_id
           ORDER BY sources DESC,last_seen DESC,length(external_id) DESC,external_id DESC
         ) AS topic_rank FROM eligible
       ) SELECT external_id FROM ranked
       GROUP BY external_id
       ORDER BY min(refresh),min(topic_rank),max(sources) DESC,max(last_seen) DESC,
                length(external_id) DESC,external_id DESC LIMIT $1`,
      [Math.min(50, Math.max(1, limit))],
    );
    return result.rows.map((row) => row.external_id);
  }
  async discoverySources() {
    return (
      await this.db.query<{ id: string; url: string }>(
        `SELECT s.id,s.url FROM social_discovery_sources s JOIN topics t ON t.id=s.topic_id
       WHERE t.enabled ORDER BY s.id`,
      )
    ).rows;
  }
  async discovered(
    sourceId: string,
    links: { externalId: string; url: string; verificationUrl?: string }[],
  ) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      for (const link of links) {
        await client.query(
          `INSERT INTO social_discovery_citations(source_id,external_id,canonical_url,verification_url) VALUES($1,$2,$3,$4)
           ON CONFLICT(source_id,external_id) DO UPDATE SET last_seen_at=now(),verification_url=COALESCE(EXCLUDED.verification_url,social_discovery_citations.verification_url)`,
          [sourceId, link.externalId, link.url, link.verificationUrl ?? null],
        );
      }
      await client.query(
        `UPDATE social_discovery_sources SET last_success=now(),last_error=NULL,last_link_count=$2 WHERE id=$1`,
        [sourceId, links.length],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async discoveryFailed(sourceId: string) {
    await this.db.query(
      `UPDATE social_discovery_sources SET last_error='Public discovery page unavailable' WHERE id=$1`,
      [sourceId],
    );
  }
  async verificationUrl(externalId: string): Promise<string | undefined> {
    const result = await this.db.query<{ verification_url: string }>(
      `SELECT verification_url FROM (
        SELECT verification_url,last_seen_at FROM x_link_citations WHERE external_id=$1
        UNION ALL SELECT verification_url,last_seen_at FROM social_discovery_citations WHERE external_id=$1
        UNION ALL SELECT verification_url,discovered_at FROM x_search_citations WHERE external_id=$1
       ) c WHERE verification_url IS NOT NULL ORDER BY last_seen_at DESC LIMIT 1`,
      [externalId],
    );
    return result.rows[0]?.verification_url;
  }
  async store(post: SocialPost) {
    await this.db.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,metrics,embed_html)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(platform,external_id)
       DO UPDATE SET published_at=COALESCE(EXCLUDED.published_at,social_posts.published_at),author=EXCLUDED.author,author_url=EXCLUDED.author_url,embed_html=EXCLUDED.embed_html,verified_at=now()`,
      [
        post.platform,
        post.externalId,
        post.url,
        post.author,
        post.authorUrl,
        post.publishedAt,
        post.metrics,
        post.embedHtml,
      ],
    );
  }
  async refreshMissingTimes(now = new Date()): Promise<number> {
    const posts = await this.db.query<{ external_id: string }>(
      "SELECT external_id FROM social_posts WHERE platform='x' AND published_at IS NULL",
    );
    let updated = 0;
    for (const post of posts.rows) {
      const time = xPostTime(post.external_id, now);
      if (!time) continue;
      const result = await this.db.query(
        "UPDATE social_posts SET published_at=$2 WHERE platform='x' AND external_id=$1 AND published_at IS NULL",
        [post.external_id, time],
      );
      updated += result.rowCount ?? 0;
    }
    return updated;
  }
  async checked(externalId: string, error: string | null) {
    await this.db.query(
      `INSERT INTO x_embed_checks(external_id,error) VALUES($1,$2)
      ON CONFLICT(external_id) DO UPDATE SET checked_at=now(),error=EXCLUDED.error`,
      [externalId, error],
    );
  }
}
