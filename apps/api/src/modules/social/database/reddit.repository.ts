import type { PoolClient } from 'pg';

import { database } from '../../../libs/db/connections';
import { extractXLinks } from '../../ingestion/public/discovery';
import type {
  RedditCollectionRepository,
  RedditPost,
  RedditRankingRepository,
} from '../domain/reddit';

export class PostgresRedditRepository
  implements RedditCollectionRepository, RedditRankingRepository
{
  readonly db = database();
  async observations(topicId: string, start: Date, end: Date) {
    return readRedditObservations(this.db, topicId, start, end);
  }
  async communities() {
    return (
      await this.db.query<{ community: string; topicIds: string[] }>(`
      SELECT lower(c.value) AS community,array_agg(DISTINCT t.id::text ORDER BY t.id::text) AS "topicIds"
      FROM topics t CROSS JOIN LATERAL jsonb_array_elements_text(t.reddit_communities) c
      WHERE t.enabled GROUP BY lower(c.value) ORDER BY lower(c.value)
    `)
    ).rows;
  }
  async store(posts: RedditPost[], topicIds: string[]) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      for (const post of posts) {
        await client.query(
          `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,metrics,embed_html,reddit_metadata)
          VALUES('reddit',$1,$2,$3,$4,$5,$6,'',$7)
          ON CONFLICT(platform,external_id) DO UPDATE SET
          canonical_url=EXCLUDED.canonical_url,author=EXCLUDED.author,author_url=EXCLUDED.author_url,
          published_at=EXCLUDED.published_at,metrics=EXCLUDED.metrics,reddit_metadata=EXCLUDED.reddit_metadata,verified_at=now()`,
          [
            post.externalId,
            post.url,
            post.author,
            post.authorUrl,
            post.publishedAt,
            post.metrics,
            {
              title: post.title,
              text: post.text,
              subreddit: post.subreddit,
              thumbnail: post.thumbnail,
              externalUrl: post.externalUrl,
            },
          ],
        );
        // Replace a post's evidence atomically when its text or destination changes.
        await client.query(
          'DELETE FROM reddit_x_citations WHERE reddit_id=$1',
          [post.externalId],
        );
        for (const link of extractXLinks(
          `${post.externalUrl ?? ''} ${post.text}`,
        )) {
          await client.query(
            `INSERT INTO reddit_x_citations(reddit_id,external_id,canonical_url,verification_url,citing_engagement)
             VALUES($1,$2,$3,$4,$5)`,
            [
              post.externalId,
              link.externalId,
              link.url,
              link.verificationUrl ?? null,
              post.metrics.score ?? 0,
            ],
          );
        }
        for (const topicId of topicIds) {
          // Recheck configuration on write so disabled/removed communities do not gain associations.
          await client.query(
            `INSERT INTO reddit_topic_posts(topic_id,external_id)
            SELECT id,$2 FROM topics WHERE id=$1 AND enabled
            AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(reddit_communities) c WHERE lower(c.value)=lower($3))
            ON CONFLICT(topic_id,external_id) DO UPDATE SET last_seen_at=now()`,
            [topicId, post.externalId, post.subreddit],
          );
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export async function readRedditObservations(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
) {
  const result = await db.query<{
    externalId: string;
    url: string;
    author: string;
    authorUrl: string;
    publishedAt: Date;
    observedAt: Date;
    metrics: RedditPost['metrics'];
    metadata: Omit<
      RedditPost,
      | 'platform'
      | 'externalId'
      | 'url'
      | 'author'
      | 'authorUrl'
      | 'publishedAt'
      | 'metrics'
    >;
    citesX: boolean;
  }>(
    `SELECT p.external_id AS "externalId",p.canonical_url AS url,p.author,
      p.author_url AS "authorUrl",p.published_at AS "publishedAt",p.verified_at AS "observedAt",
      p.metrics,p.reddit_metadata AS metadata,
      EXISTS(SELECT 1 FROM reddit_x_citations c WHERE c.reddit_id=p.external_id) AS "citesX"
      FROM social_posts p JOIN reddit_topic_posts r ON r.external_id=p.external_id
      JOIN topics t ON t.id=r.topic_id
      WHERE p.platform='reddit' AND t.id=$1 AND t.enabled
      AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(t.reddit_communities) c
        WHERE lower(c.value)=lower(p.reddit_metadata->>'subreddit'))
      AND p.published_at >= $2::timestamptz - interval '7 days' AND p.published_at < $3
      ORDER BY p.published_at DESC,p.external_id LIMIT 5000`,
    [topicId, start, end],
  );
  return result.rows.map((row) => ({
    post: {
      ...row.metadata,
      platform: 'reddit' as const,
      externalId: row.externalId,
      url: row.url,
      author: row.author,
      authorUrl: row.authorUrl,
      publishedAt: row.publishedAt.toISOString(),
      metrics: row.metrics,
    },
    observedAt: row.observedAt.toISOString(),
    citesX: row.citesX,
  }));
}
