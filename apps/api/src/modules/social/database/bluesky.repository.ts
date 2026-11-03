import type { PoolClient } from 'pg';

import { database } from '../../../libs/db/connections';
import type { BlueskyPost, BlueskyRepository } from '../domain/bluesky';

// Collection writes are explicit; edition reads use the publisher transaction.
export class PostgresBlueskyRepository implements BlueskyRepository {
  readonly db = database();
  async store(topicId: string, posts: BlueskyPost[]) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Lock configuration until commit; disabled/deleted topics gain no observations.
      const topic = await client.query(
        'SELECT id FROM topics WHERE id=$1 AND enabled FOR SHARE',
        [topicId],
      );
      if (topic.rowCount)
        for (const post of posts) {
          if (
            post.platform !== 'bluesky' ||
            Object.values(post.metrics).some(
              (n) => !Number.isSafeInteger(n) || n < 0,
            )
          )
            throw new Error('Invalid Bluesky observation');
          await client.query(
            `INSERT INTO social_posts(platform,external_id,canonical_url,author,author_url,published_at,metrics,embed_html,verified_at,bluesky_metadata)
          VALUES('bluesky',$1,$2,$3,$4,$5,$6,'',$7,$8)
          ON CONFLICT(platform,external_id) DO UPDATE SET
          canonical_url=EXCLUDED.canonical_url,author=EXCLUDED.author,author_url=EXCLUDED.author_url,
          published_at=EXCLUDED.published_at,metrics=EXCLUDED.metrics,verified_at=EXCLUDED.verified_at,
          bluesky_metadata=EXCLUDED.bluesky_metadata
          WHERE social_posts.verified_at < EXCLUDED.verified_at`,
            [
              post.externalId,
              post.url,
              post.author,
              `https://bsky.app/profile/${encodeURIComponent(post.author)}`,
              post.publishedAt,
              post.metrics,
              post.observedAt,
              { text: post.text, media: post.media ?? [] },
            ],
          );
          await client.query(
            `INSERT INTO bluesky_observations(topic_id,external_id,observed_at,published_at,snapshot)
          VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
            [topicId, post.externalId, post.observedAt, post.publishedAt, post],
          );
        }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async observations(topicId: string, start: Date, end: Date, cutoff: Date) {
    return readBlueskyObservations(this.db, topicId, start, end, cutoff);
  }
}

export async function readBlueskyObservations(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  start: Date,
  end: Date,
  cutoff: Date,
) {
  if (
    ![start, end, cutoff].every((d) => Number.isFinite(d.getTime())) ||
    start >= end
  )
    throw new Error('Invalid Bluesky observation window');
  const result = await db.query<{ snapshot: BlueskyPost }>(
    `SELECT o.snapshot FROM bluesky_observations o JOIN topics t ON t.id=o.topic_id
      WHERE t.id=$1 AND t.enabled AND o.published_at >= $2 AND o.published_at < $3 AND o.observed_at <= $4
      ORDER BY o.published_at DESC,o.external_id,o.observed_at DESC LIMIT 5000`,
    [topicId, start, end, cutoff],
  );
  return result.rows.map((row) => row.snapshot);
}
