import { database } from '../../../libs/db/connections';
import type { SocialPost } from '../domain/posts';

export class PostgresSocialRepository {
  readonly db = database();
  async candidates(limit: number): Promise<string[]> {
    const result = await this.db.query<{ external_id: string }>(
      `SELECT c.external_id FROM x_link_citations c
       LEFT JOIN x_embed_checks v ON v.external_id=c.external_id
       WHERE v.checked_at IS NULL OR v.checked_at < now() - interval '1 day'
       GROUP BY c.external_id ORDER BY count(DISTINCT c.source_id) DESC,max(c.last_seen_at) DESC,c.external_id LIMIT $1`,
      [Math.min(50, Math.max(1, limit))],
    );
    return result.rows.map((row) => row.external_id);
  }
  async store(post: SocialPost) {
    await this.db.query(
      `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,metrics,embed_html)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(platform,external_id)
       DO UPDATE SET author=EXCLUDED.author,author_url=EXCLUDED.author_url,embed_html=EXCLUDED.embed_html,verified_at=now()`,
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
  async checked(externalId: string, error: string | null) {
    await this.db.query(
      `INSERT INTO x_embed_checks(external_id,error) VALUES($1,$2)
      ON CONFLICT(external_id) DO UPDATE SET checked_at=now(),error=EXCLUDED.error`,
      [externalId, error],
    );
  }
}
