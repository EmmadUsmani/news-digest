import { database } from '../../../libs/db/connections';
import { extractXLinks } from '../../ingestion/public/discovery';
import type { RedditCollectionRepository, RedditPost } from '../domain/reddit';

export class PostgresRedditRepository implements RedditCollectionRepository {
  readonly db = database();
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
