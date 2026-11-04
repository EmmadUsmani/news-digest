import {
  and,
  count,
  DrizzleQueryError,
  eq,
  exists,
  gt,
  inArray,
  isNotNull,
  isNull,
  lt,
  ne,
  notExists,
  or,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { alias, type AnyPgColumn } from 'drizzle-orm/pg-core';
import type { Pool, PoolClient } from 'pg';

import {
  socialPosts,
  topics,
  xDiscoveryCalls,
  xDiscoveryProviderBlock,
  xSearchCitations,
} from '../../../libs/db/schema';
import {
  validateXCaps,
  type XDiscoveryCaps,
  xDiscoveryCaps,
  xDiscoveryCost,
  type XDiscoveryPrice,
  type XDiscoveryUsage,
} from '../domain/x-discovery-budget';
import type {
  XDiscoveryLedger,
  XDiscoverySearchType,
} from '../domain/x-discovery-ledger.port';
import type { XSearchToolCall } from '../domain/x-search.port';

export class PostgresXDiscoveryLedger implements XDiscoveryLedger {
  readonly caps: Readonly<XDiscoveryCaps>;
  constructor(
    readonly db: Pool,
    caps: XDiscoveryCaps = xDiscoveryCaps,
  ) {
    validateXCaps(caps);
    this.caps = Object.freeze({ ...caps });
  }
  private async transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.db.connect();
    try {
      return await drizzle(client).transaction(async (tx) => {
        // Shared across API, worker and explicit discovery commands. Never hold during HTTP.
        await tx
          .select({ lock: sql`pg_advisory_xact_lock(756283)` })
          .from(sql`(values (1)) as singleton(value)`);
        // All ledger queries stay bound to this same checked-out transaction client.
        return work(client);
      });
    } catch (error) {
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    } finally {
      client.release();
    }
  }
  private async totals(client: Pool | PoolClient) {
    const calls = xDiscoveryCalls;
    // Conditional aggregates retain PostgreSQL FILTER and UTC wall-clock bounds;
    // earlier pending/uncertain holds count against both periods.
    const [totals] = await drizzle(client)
      .select({
        todayMicros: sql<number>`coalesce(sum(coalesce(${calls.costMicros}, ${calls.reservedMicros})) filter (
          where ${calls.createdAt} >= date_trunc('day',clock_timestamp() at time zone 'UTC') at time zone 'UTC'
          or ${calls.status} in ('pending','uncertain')),0)::float8`,
        monthMicros: sql<number>`coalesce(sum(coalesce(${calls.costMicros}, ${calls.reservedMicros})) filter (
          where ${calls.createdAt} >= date_trunc('month',clock_timestamp() at time zone 'UTC') at time zone 'UTC'
          or ${calls.status} in ('pending','uncertain')),0)::float8`,
        reservedMicros: sql<number>`coalesce(sum(${calls.reservedMicros}) filter (
          where ${calls.status} in ('pending','uncertain')),0)::float8`,
        blocked: sql<boolean>`exists(${drizzle(client).select({ singleton: xDiscoveryProviderBlock.singleton }).from(xDiscoveryProviderBlock)})`,
      })
      .from(calls)
      .where(ne(calls.status, 'failed'));
    return {
      ...totals,
      ...this.caps,
      availableMicros: totals.blocked
        ? 0
        : Math.max(
            0,
            Math.min(
              this.caps.dailyMicros - totals.todayMicros,
              this.caps.monthlyMicros - totals.monthMicros,
            ),
          ),
    };
  }
  async status() {
    return this.totals(this.db);
  }
  async reserve(
    model: string,
    runId: string,
    estimateMicros: number,
    requestedTopic?: { id: string; name: string },
    scheduledDay?: string,
    searchType?: XDiscoverySearchType,
    optionalParentId?: string,
  ) {
    if (
      !model.trim() ||
      model.length > 100 ||
      !runId.trim() ||
      runId.length > 200 ||
      !Number.isSafeInteger(estimateMicros) ||
      estimateMicros <= 0
    )
      throw new Error('Invalid X discovery reservation');
    if (
      scheduledDay !== undefined &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDay) ||
        !Number.isFinite(Date.parse(scheduledDay)) ||
        new Date(scheduledDay).toISOString().slice(0, 10) !== scheduledDay)
    )
      throw new Error('Invalid scheduled X discovery day');
    if (scheduledDay !== undefined && !requestedTopic?.id.trim())
      throw new Error('Scheduled X discovery requires a topic');
    if (
      searchType !== undefined &&
      ![
        'open-topic',
        'account-list',
        'story-reactions',
        'fixed-reactions',
        'fixed-trending',
      ].includes(searchType)
    )
      throw new Error('Invalid X discovery search type');
    if (
      optionalParentId !== undefined &&
      (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(optionalParentId) ||
        scheduledDay === undefined ||
        !['account-list', 'story-reactions'].includes(searchType ?? ''))
    )
      throw new Error('Invalid optional X discovery reservation');
    const fixed =
      searchType === 'fixed-reactions' || searchType === 'fixed-trending';
    if (fixed && (scheduledDay === undefined || optionalParentId !== undefined))
      throw new Error('Fixed X discovery requires a scheduled primary slot');
    return this.transaction(async (client) => {
      // A topic/day is consumed before HTTP, including rejected/uncertain calls.
      // Restart/retry cannot spend again or shift an obsolete job into today.
      if (scheduledDay !== undefined) {
        const orm = drizzle(client);
        const calls = xDiscoveryCalls;
        const parent = alias(calls, 'parent');
        const topicId = requestedTopic?.id ?? '';
        const enabledTopics = and(
          eq(topics.enabled, true),
          gt(topics.postBudget, 0),
        );
        // JSON topic ids and the UTC database wall clock need SQL expressions;
        // all admission subqueries remain typed and share the budget lock.
        const topicMatches = (column: AnyPgColumn) =>
          eq(sql`${column}->>'id'`, topicId);
        const completedOpenParent = and(
          eq(parent.scheduledDay, scheduledDay),
          isNull(parent.optionalParentId),
          eq(parent.searchType, 'open-topic'),
          eq(parent.status, 'succeeded'),
          isNotNull(parent.verificationCompletedAt),
        );
        const unclassifiedCitations = orm
          .select({ id: xSearchCitations.callId })
          .from(xSearchCitations)
          .where(
            and(
              eq(xSearchCitations.callId, parent.id),
              isNull(xSearchCitations.newCandidate),
            ),
          );
        const newVerifiedPosts = orm
          .select({ count: count() })
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
              eq(xSearchCitations.callId, parent.id),
              eq(sql`${xSearchCitations.topicId}::text`, topicId),
              eq(xSearchCitations.newCandidate, true),
            ),
          );
        const eligibleParent = orm
          .select({ id: parent.id })
          .from(parent)
          .where(
            and(
              eq(
                parent.id,
                optionalParentId ?? '00000000-0000-0000-0000-000000000000',
              ),
              completedOpenParent,
              topicMatches(parent.requestedTopic),
              notExists(unclassifiedCitations),
              lt(newVerifiedPosts, 3),
            ),
          );
        const completedTopicSearch = orm
          .select({ id: parent.id })
          .from(parent)
          .where(
            and(
              completedOpenParent,
              eq(sql`${parent.requestedTopic}->>'id'`, sql`${topics.id}::text`),
            ),
          );
        const unfinishedTopics = orm
          .select({ id: topics.id })
          .from(topics)
          .where(and(enabledTopics, notExists(completedTopicSearch)));
        const consumedAttempt = orm
          .select({ id: calls.id })
          .from(calls)
          .where(
            and(
              eq(calls.scheduledDay, scheduledDay),
              topicMatches(calls.requestedTopic),
              fixed
                ? or(
                    eq(calls.searchType, searchType),
                    isNull(calls.searchType),
                    inArray(calls.searchType, [
                      'open-topic',
                      'account-list',
                      'story-reactions',
                    ]),
                  )
                : optionalParentId === undefined
                  ? isNull(calls.optionalParentId)
                  : isNotNull(calls.optionalParentId),
            ),
          );
        const [admission] = await orm
          .select({
            allowed: sql<boolean>`${and(
              sql`${scheduledDay}::date = (clock_timestamp() AT TIME ZONE 'UTC')::date`,
              notExists(consumedAttempt),
              optionalParentId === undefined
                ? undefined
                : and(
                    exists(
                      orm
                        .select({ id: topics.id })
                        .from(topics)
                        .where(
                          and(
                            eq(sql`${topics.id}::text`, topicId),
                            enabledTopics,
                          ),
                        ),
                    ),
                    exists(eligibleParent),
                    notExists(unfinishedTopics),
                  ),
            )}`,
          })
          .from(sql`(values (1)) as singleton(value)`);
        if (!admission.allowed) return null;
      }
      const totals = await this.totals(client);
      if (totals.availableMicros < estimateMicros) return null;
      const id = crypto.randomUUID();
      await drizzle(client)
        .insert(xDiscoveryCalls)
        .values({
          id,
          model,
          runId,
          status: 'pending',
          reservedMicros: estimateMicros,
          requestedTopic: requestedTopic ?? null,
          scheduledDay: scheduledDay ?? null,
          searchType: searchType ?? null,
          optionalParentId: optionalParentId ?? null,
        });
      return id;
    });
  }
  // The scheduler calls this only after citation persistence and bounded
  // official verification finish. Settlement alone cannot authorize a followup.
  async completeVerification(id: string) {
    await this.transaction(async (client) => {
      const result = await drizzle(client)
        .update(xDiscoveryCalls)
        .set({
          verificationCompletedAt: sql`coalesce(${xDiscoveryCalls.verificationCompletedAt}, clock_timestamp())`,
        })
        .where(
          and(
            eq(xDiscoveryCalls.id, id),
            eq(xDiscoveryCalls.status, 'succeeded'),
            eq(xDiscoveryCalls.searchType, 'open-topic'),
            isNotNull(xDiscoveryCalls.scheduledDay),
            isNull(xDiscoveryCalls.optionalParentId),
          ),
        )
        .returning({ id: xDiscoveryCalls.id });
      if (!result.length) throw new Error('X open search is not completed');
    });
  }
  async settle(
    id: string,
    usage: XDiscoveryUsage,
    price: XDiscoveryPrice,
    toolCalls?: XSearchToolCall[],
  ) {
    const cost = xDiscoveryCost(usage, price);
    await this.transaction(async (client) => {
      const result = await drizzle(client)
        .update(xDiscoveryCalls)
        .set({
          toolCalls: toolCalls ?? null,
          status: 'succeeded',
          completedAt: sql`clock_timestamp()`,
          costMicros: cost,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          postsFetched: usage.postsFetched,
          profilesFetched: usage.profilesFetched,
          // Compare the final provider charge with the persisted hold atomically.
          errorCode: sql`case when ${cost} > ${xDiscoveryCalls.reservedMicros} then 'estimate-exceeded' else null end`,
        })
        .where(
          and(
            eq(xDiscoveryCalls.id, id),
            inArray(xDiscoveryCalls.status, ['pending', 'uncertain']),
          ),
        )
        .returning({ id: xDiscoveryCalls.id });
      if (!result.length)
        throw new Error('X discovery reservation is not open');
    });
  }
  async fail(
    id: string,
    reason: 'credits-depleted' | 'rejected' | 'uncertain',
  ) {
    await this.transaction(async (client) => {
      const orm = drizzle(client);
      const result = await orm
        .update(xDiscoveryCalls)
        .set({
          status: reason === 'uncertain' ? 'uncertain' : 'failed',
          completedAt: sql`clock_timestamp()`,
          errorCode: reason,
        })
        .where(
          and(
            eq(xDiscoveryCalls.id, id),
            eq(xDiscoveryCalls.status, 'pending'),
          ),
        )
        .returning({ id: xDiscoveryCalls.id });
      if (!result.length)
        throw new Error('X discovery reservation is not open');
      if (reason === 'credits-depleted')
        await orm
          .insert(xDiscoveryProviderBlock)
          .values({ singleton: true, errorCode: 'credits-depleted' })
          .onConflictDoNothing();
    });
  }
}
