import { database } from '../../../libs/db/connections';
import { extractXLinks } from '../../ingestion/public/discovery';
import type {
  ArticleDiscoveryRepository,
  DiscoveryArticle,
} from '../domain/article-discovery.port';
import type { DiscoveredLink } from '../domain/collection.port';

export class PostgresArticleDiscoveryRepository implements ArticleDiscoveryRepository {
  readonly db = database();
  async candidates(): Promise<DiscoveryArticle[]> {
    return (
      await this.db.query<DiscoveryArticle>(
        `WITH ranked AS (
        SELECT i.id,i.canonical_url AS url,s.article_discovery_host AS host,
          row_number() OVER(PARTITION BY t.id ORDER BY i.published_at DESC,i.id) AS rank,t.position
        FROM content_items i JOIN content_observations o ON o.item_id=i.id
        JOIN content_sources s ON s.id=o.source_id
        JOIN topic_source_connections c ON c.source_id=s.id
        JOIN topics t ON t.id=c.topic_id AND t.enabled
        LEFT JOIN article_x_discovery_checks v ON v.item_id=i.id
        WHERE s.article_discovery_host IS NOT NULL
          AND i.canonical_url LIKE 'https://' || s.article_discovery_host || '/%'
          AND i.published_at >= now()-interval '3 days' AND i.published_at <= now()
          AND (v.item_id IS NULL OR v.checked_at < now() -
               CASE WHEN v.last_error IS NULL THEN interval '7 days' ELSE interval '1 day' END)
      ) SELECT id,url,host FROM ranked GROUP BY id,url,host
        ORDER BY min(rank),min(position),id LIMIT 8`,
      )
    ).rows;
  }
  async record(article: DiscoveryArticle, links: DiscoveredLink[] | null) {
    const validated = extractXLinks(
      (links ?? []).map((l) => l.verificationUrl ?? l.url).join(' '),
    );
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      for (const link of validated) {
        await client.query(
          `INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url,citing_engagement,verification_url)
           SELECT $2,i.id,s.id,$3,i.engagement,$4 FROM content_items i
           JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id
           WHERE i.id=$1 AND s.article_discovery_host=$5 AND EXISTS(
             SELECT 1 FROM topic_source_connections c JOIN topics t ON t.id=c.topic_id
             WHERE c.source_id=s.id AND t.enabled)
           ON CONFLICT(external_id,item_id,source_id) DO UPDATE SET last_seen_at=now(),
             verification_url=COALESCE(EXCLUDED.verification_url,x_link_citations.verification_url)`,
          [
            article.id,
            link.externalId,
            link.url,
            link.verificationUrl ?? null,
            article.host,
          ],
        );
      }
      await client.query(
        `INSERT INTO article_x_discovery_checks(item_id,last_error,link_count) VALUES($1,$2,$3)
         ON CONFLICT(item_id) DO UPDATE SET checked_at=now(),last_error=EXCLUDED.last_error,link_count=EXCLUDED.link_count`,
        [
          article.id,
          links === null ? 'Public publisher page unavailable' : null,
          validated.length,
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
