import { Injectable, OnModuleDestroy } from '@nestjs/common';

import { database } from '../../../libs/db/connections';
import { ContentItem, ContentRepository, Source } from '../domain/ports';
import { extractXLinks } from '../domain/x-links';
@Injectable()
export class PostgresContentRepository
  extends ContentRepository
  implements OnModuleDestroy
{
  readonly db = database();
  async sources(): Promise<Source[]> {
    return (
      await this.db.query(
        `SELECT s.id,s.topic_id AS "topicId",s.name,s.kind,s.url FROM content_sources s WHERE EXISTS (SELECT 1 FROM topic_source_connections c JOIN topics t ON t.id=c.topic_id WHERE c.source_id=s.id AND t.enabled) ORDER BY s.id`,
      )
    ).rows;
  }
  async store(source: Source, items: ContentItem[]) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        const row = await client.query(
          `INSERT INTO content_items(canonical_url,title,excerpt,author,published_at,image_url,engagement) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(canonical_url) DO UPDATE SET title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,engagement=content_items.engagement || EXCLUDED.engagement RETURNING id`,
          [
            item.url,
            item.title,
            item.excerpt,
            item.author,
            item.publishedAt,
            item.imageUrl,
            item.engagement,
          ],
        );
        await client.query(
          'INSERT INTO content_observations(source_id,item_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
          [source.id, row.rows[0].id],
        );
        // Revalidate at the persistence boundary; source content is untrusted.
        const links = extractXLinks(
          [item.url, ...(item.xLinks ?? []).map((link) => link.url)].join(' '),
        );
        for (const link of links) {
          await client.query(
            `INSERT INTO x_link_citations(external_id,item_id,source_id,canonical_url,citing_engagement)
             VALUES($1,$2,$3,$4,$5) ON CONFLICT(external_id,item_id,source_id)
             DO UPDATE SET last_seen_at=now(),citing_engagement=EXCLUDED.citing_engagement`,
            [
              link.externalId,
              row.rows[0].id,
              source.id,
              link.url,
              item.engagement,
            ],
          );
        }
      }
      await client.query(
        'UPDATE content_sources SET last_attempt=now(),last_success=now(),last_error=NULL,last_item_count=$2 WHERE id=$1',
        [source.id, items.length],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async failed(source: Source, message: string) {
    await this.db.query(
      'UPDATE content_sources SET last_attempt=now(),last_error=$2 WHERE id=$1',
      [source.id, message.slice(0, 300)],
    );
  }
  async latest() {
    return (
      await this.db.query(
        `SELECT t.id AS "topicId", COALESCE((SELECT jsonb_agg(r) FROM (SELECT i.id,i.title,i.canonical_url AS url,i.published_at AS "publishedAt", min(s.name) AS source FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=t.id AND i.canonical_url NOT LIKE '%/betting/%' GROUP BY i.id ORDER BY i.published_at DESC LIMIT 5) r),'[]') AS items FROM topics t WHERE t.enabled ORDER BY t.position`,
      )
    ).rows;
  }
  async status() {
    return (
      await this.db.query(
        `SELECT s.id,s.name,s.url,s.topic_id AS "topicId",s.last_attempt AS "lastAttempt",s.last_success AS "lastSuccess",s.last_error AS error,s.last_item_count AS "lastItemCount",count(o.item_id)::int AS "storedItems" FROM content_sources s LEFT JOIN content_observations o ON o.source_id=s.id GROUP BY s.id ORDER BY s.id`,
      )
    ).rows;
  }
  async onModuleDestroy() {
    await this.db.end();
  }
}
