import {
  and,
  asc,
  desc,
  DrizzleQueryError,
  eq,
  gte,
  lt,
  lte,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { database } from '../../../libs/db/connections';
import {
  blueskyObservations,
  socialPosts,
  topics,
} from '../../../libs/db/schema';
import type { BlueskyPost, BlueskyRepository } from '../domain/bluesky';

// Collection writes are explicit; edition reads use the publisher transaction.
export class PostgresBlueskyRepository implements BlueskyRepository {
  readonly db = database();
  async store(topicId: string, posts: BlueskyPost[]) {
    await drizzle(this.db)
      .transaction(async (tx) => {
        // Lock configuration until commit; disabled/deleted topics gain no observations.
        const [topic] = await tx
          .select({ id: topics.id })
          .from(topics)
          .where(and(eq(topics.id, topicId), eq(topics.enabled, true)))
          .for('share');
        if (!topic) return;
        for (const post of posts) {
          if (
            post.platform !== 'bluesky' ||
            Object.values(post.metrics).some(
              (n) => !Number.isSafeInteger(n) || n < 0,
            )
          )
            throw new Error('Invalid Bluesky observation');
          const values = {
            canonicalUrl: post.url,
            author: post.author,
            authorUrl: `https://bsky.app/profile/${encodeURIComponent(post.author)}`,
            publishedAt: post.publishedAt,
            metrics: post.metrics,
            verifiedAt: post.observedAt,
            blueskyMetadata: { text: post.text, media: post.media ?? [] },
          };
          await tx
            .insert(socialPosts)
            .values({
              ...values,
              platform: 'bluesky',
              externalId: post.externalId,
              embedHtml: '',
            })
            .onConflictDoUpdate({
              target: [socialPosts.platform, socialPosts.externalId],
              set: values,
              setWhere: lt(socialPosts.verifiedAt, post.observedAt),
            });
          await tx
            .insert(blueskyObservations)
            .values({
              topicId,
              externalId: post.externalId,
              observedAt: post.observedAt,
              publishedAt: post.publishedAt,
              snapshot: post,
            })
            .onConflictDoNothing();
        }
      })
      .catch((error: unknown) => {
        // Preserve the port's original PostgreSQL errors after transaction rollback.
        if (error instanceof DrizzleQueryError && error.cause)
          throw error.cause;
        throw error;
      });
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
  // Read-only builder uses only query; retain the publisher transaction client.
  const rows = await drizzle(db as PoolClient)
    .select({ snapshot: blueskyObservations.snapshot })
    .from(blueskyObservations)
    .innerJoin(topics, eq(topics.id, blueskyObservations.topicId))
    .where(
      and(
        eq(topics.id, topicId),
        eq(topics.enabled, true),
        gte(blueskyObservations.publishedAt, start.toISOString()),
        lt(blueskyObservations.publishedAt, end.toISOString()),
        lte(blueskyObservations.observedAt, cutoff.toISOString()),
      ),
    )
    .orderBy(
      desc(blueskyObservations.publishedAt),
      asc(blueskyObservations.externalId),
      desc(blueskyObservations.observedAt),
    )
    .limit(5000);
  return rows.map((row) => row.snapshot as BlueskyPost);
}
