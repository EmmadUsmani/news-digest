import {
  and,
  desc,
  DrizzleQueryError,
  eq,
  gt,
  gte,
  isNotNull,
  isNull,
  lt,
  notExists,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import {
  socialDiscoveryCitations,
  socialDiscoverySources,
  socialPosts,
  topics,
  topicSourceConnections,
  xDiscoveryCalls,
  xEmbedChecks,
  xLinkCitations,
  xSearchCitations,
} from '../../../libs/db/schema';
import type { DiscoveredLink } from '../domain/collection.port';
import type { ScheduledSearchTopic } from '../domain/scheduled-search';
import type {
  XReportedEngagement,
  XSearchRepository,
} from '../domain/x-search.port';

export class PostgresXSearchRepository implements XSearchRepository {
  constructor(readonly db: Pool) {}
  async scheduledTopics(end: Date): Promise<ScheduledSearchTopic[]> {
    const db = drizzle(this.db);
    const freeTopics = db.$with('free_topics').as(
      db
        .select({
          externalId: xLinkCitations.externalId,
          topicId: sql<string | null>`${topicSourceConnections.topicId}`.as(
            'topic_id',
          ),
        })
        .from(xLinkCitations)
        .innerJoin(
          topicSourceConnections,
          eq(topicSourceConnections.sourceId, xLinkCitations.sourceId),
        )
        .union(
          db
            .select({
              externalId: socialDiscoveryCitations.externalId,
              topicId: socialDiscoverySources.topicId,
            })
            .from(socialDiscoveryCitations)
            .innerJoin(
              socialDiscoverySources,
              eq(socialDiscoverySources.id, socialDiscoveryCitations.sourceId),
            ),
        ),
    );
    const count = db
      .select({ count: sql<number>`count(*)::int` })
      .from(freeTopics)
      .innerJoin(
        socialPosts,
        and(
          eq(socialPosts.platform, 'x'),
          eq(socialPosts.externalId, freeTopics.externalId),
        ),
      )
      .where(
        and(
          eq(freeTopics.topicId, topics.id),
          gte(
            socialPosts.publishedAt,
            sql`${end.toISOString()}::timestamptz - interval '24 hours'`,
          ),
          lt(socialPosts.publishedAt, end.toISOString()),
        ),
      );
    return db
      .with(freeTopics)
      .select({
        id: topics.id,
        name: topics.name,
        guidance: topics.includeGuidance,
        handles: sql<string[]>`${topics.accounts}`,
        freePosts: sql<number>`(${count})`,
      })
      .from(topics)
      .where(and(eq(topics.enabled, true), gt(topics.postBudget, 0)))
      .orderBy(topics.position, topics.id);
  }
  // Persisted evidence for followup planning after a worker restart. Absence,
  // unfinished verification and historical unknown attribution all fail closed.
  // Admission must still revalidate this evidence under the shared ledger lock.
  async completedOpenSearches(day: string) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      !Number.isFinite(Date.parse(day)) ||
      new Date(day).toISOString().slice(0, 10) !== day
    )
      throw new Error('Expected a valid UTC date (YYYY-MM-DD)');
    const db = drizzle(this.db);
    const verified = db
      .select({ count: sql<number>`count(*)::int` })
      .from(xSearchCitations)
      .innerJoin(
        socialPosts,
        and(
          eq(socialPosts.platform, 'x'),
          eq(socialPosts.externalId, xSearchCitations.externalId),
        ),
      )
      .where(
        and(
          eq(xSearchCitations.callId, xDiscoveryCalls.id),
          eq(xSearchCitations.topicId, topics.id),
          eq(xSearchCitations.newCandidate, true),
        ),
      );
    const unknown = db
      .select({ id: xSearchCitations.externalId })
      .from(xSearchCitations)
      .where(
        and(
          eq(xSearchCitations.callId, xDiscoveryCalls.id),
          isNull(xSearchCitations.newCandidate),
        ),
      );
    return db
      .select({
        topicId: topics.id,
        openCallId: xDiscoveryCalls.id,
        openVerifiedAdditions: sql<number>`(${verified})`,
      })
      .from(topics)
      .innerJoin(
        xDiscoveryCalls,
        eq(
          sql`${xDiscoveryCalls.requestedTopic}->>'id'`,
          sql`${topics.id}::text`,
        ),
      )
      .where(
        and(
          eq(topics.enabled, true),
          gt(topics.postBudget, 0),
          eq(xDiscoveryCalls.scheduledDay, day),
          isNull(xDiscoveryCalls.optionalParentId),
          eq(xDiscoveryCalls.searchType, 'open-topic'),
          eq(xDiscoveryCalls.status, 'succeeded'),
          isNotNull(xDiscoveryCalls.verificationCompletedAt),
          notExists(unknown),
        ),
      )
      .orderBy(topics.position, topics.id);
  }
  async verificationCandidates(callId: string): Promise<string[]> {
    const rows = await drizzle(this.db)
      .select({ externalId: xSearchCitations.externalId })
      .from(xSearchCitations)
      .innerJoin(
        topics,
        and(
          eq(topics.id, xSearchCitations.topicId),
          eq(topics.enabled, true),
          gt(topics.postBudget, 0),
        ),
      )
      .leftJoin(
        socialPosts,
        and(
          eq(socialPosts.platform, 'x'),
          eq(socialPosts.externalId, xSearchCitations.externalId),
        ),
      )
      .leftJoin(
        xEmbedChecks,
        eq(xEmbedChecks.externalId, xSearchCitations.externalId),
      )
      .where(
        and(
          eq(xSearchCitations.callId, callId),
          isNull(socialPosts.externalId),
          or(
            isNull(xEmbedChecks.checkedAt),
            lt(xEmbedChecks.checkedAt, sql`now() - interval '1 day'`),
          ),
        ),
      )
      .orderBy(
        desc(sql`length(${xSearchCitations.externalId})`),
        desc(xSearchCitations.externalId),
      )
      .limit(10);
    return rows.map((row) => row.externalId);
  }
  async topic(id: string) {
    const [row] = await drizzle(this.db)
      .select({
        id: topics.id,
        name: topics.name,
        guidance: topics.includeGuidance,
        handles: sql<string[]>`${topics.accounts}`,
      })
      .from(topics)
      .where(
        and(
          eq(topics.id, id),
          eq(topics.enabled, true),
          gt(topics.postBudget, 0),
        ),
      );
    return row;
  }
  async save(
    topicId: string,
    callId: string,
    links: DiscoveredLink[],
    reportedEngagement: XReportedEngagement[] = [],
  ) {
    await drizzle(this.db)
      .transaction(async (tx) => {
        // Serialize first-search attribution across concurrent search saves.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(756284)`);
        for (const link of links) {
          const post = tx
            .select({ id: socialPosts.externalId })
            .from(socialPosts)
            .where(
              and(
                eq(socialPosts.platform, 'x'),
                eq(socialPosts.externalId, link.externalId),
              ),
            );
          const citation = tx
            .select({ id: xSearchCitations.externalId })
            .from(xSearchCitations)
            .where(eq(xSearchCitations.externalId, link.externalId));
          await tx
            .insert(xSearchCitations)
            .values({
              callId,
              topicId,
              externalId: link.externalId,
              canonicalUrl: link.url,
              verificationUrl: link.verificationUrl ?? null,
              newCandidate: and(notExists(post), notExists(citation)),
              // Citation-bound reports stay separate from officially verified posts.
              reportedEngagement:
                reportedEngagement.find(
                  (report) => report.externalId === link.externalId,
                ) ?? null,
            })
            .onConflictDoNothing();
        }
      })
      .catch((error: unknown) => {
        // Preserve PostgreSQL error codes after transaction rollback.
        throw error instanceof DrizzleQueryError && error.cause
          ? error.cause
          : error;
      });
  }
}
