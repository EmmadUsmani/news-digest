import { randomUUID } from 'node:crypto';

import type { CustomFeed, Topic, TopicUpdate } from '@digest/contracts';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  and,
  count,
  DrizzleQueryError,
  eq,
  getTableColumns,
  inArray,
  max,
  sql,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import {
  contentSources,
  profiles,
  topics,
  topicSourceConnections as connections,
} from '../../../libs/db/schema';
import { TopicRepository } from '../domain/topic.repository';

const profileId = '00000000-0000-4000-8000-000000000001';
const owned = (id: string) =>
  and(eq(topics.id, id), eq(topics.profileId, profileId));

@Injectable()
export class PostgresTopicRepository
  extends TopicRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  private async preserveErrors<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      // Preserve native constraint codes and messages exposed by the existing adapter.
      throw error instanceof DrizzleQueryError && error.cause
        ? error.cause
        : error;
    }
  }

  async listDefault(): Promise<Topic[]> {
    const sourceList = this.db
      .select({
        value:
          // Ordered JSON aggregation has no query-builder equivalent.
          sql<
            string[]
          >`coalesce(jsonb_agg(${connections.sourceId} order by ${connections.sourceId}), '[]'::jsonb)`,
      })
      .from(connections)
      .where(eq(connections.topicId, topics.id));
    const rows = await this.db
      .select({
        ...getTableColumns(topics),
        sources: sql<string[]>`(${sourceList})`,
      })
      .from(topics)
      .where(eq(topics.profileId, profileId))
      .orderBy(topics.position, topics.id);
    return rows as Topic[];
  }
  async setSourceEnabled(id: string, enabled: boolean): Promise<boolean> {
    const changed = await this.db
      .update(contentSources)
      .set({ enabled })
      .where(eq(contentSources.id, id))
      .returning({ id: contentSources.id });
    return changed.length > 0;
  }
  async catalog() {
    return this.db
      .select({
        id: contentSources.id,
        name: contentSources.name,
        url: contentSources.url,
      })
      .from(contentSources)
      .orderBy(contentSources.name, contentSources.id);
  }
  async addFeedDefault(
    id: string,
    input: CustomFeed,
  ): Promise<Topic | null | false> {
    const outcome = await this.preserveErrors(() =>
      this.db.transaction(async (tx) => {
        // A singleton source executes the PostgreSQL lock function exactly once.
        await tx
          .select({
            lock: sql`pg_advisory_xact_lock(hashtext('custom-feed-catalog'))`,
          })
          .from(sql`(values (1)) as singleton(value)`);
        const topic = await tx
          .select({ id: topics.id })
          .from(topics)
          .where(owned(id))
          .for('update');
        if (!topic.length) return null;
        const existing = await tx
          .select({ id: contentSources.id })
          .from(contentSources)
          .where(
            and(
              eq(contentSources.kind, 'feed'),
              eq(contentSources.url, input.url),
            ),
          )
          .orderBy(contentSources.id)
          .limit(1);
        const sourceId = existing[0]?.id ?? `feed-${randomUUID()}`;
        const [catalog] = await tx
          .select({ value: count() })
          .from(contentSources);
        const [connectedCount] = await tx
          .select({ value: count() })
          .from(connections)
          .where(eq(connections.topicId, id));
        const connected = await tx
          .select({ id: connections.sourceId })
          .from(connections)
          .where(
            and(
              eq(connections.topicId, id),
              eq(connections.sourceId, sourceId),
            ),
          );
        if (
          (!existing.length && catalog.value >= 500) ||
          (!connected.length && connectedCount.value >= 100)
        )
          return false;
        if (!existing.length)
          await tx.insert(contentSources).values({
            id: sourceId,
            name: input.name,
            kind: 'feed',
            url: input.url,
          });
        await tx
          .insert(connections)
          .values({ topicId: id, sourceId })
          .onConflictDoNothing();
        return true;
      }),
    );
    if (outcome !== true) return outcome;
    return (await this.listDefault()).find((t) => t.id === id) ?? null;
  }
  async connectDefault(
    id: string,
    ids: string[],
  ): Promise<Topic | null | false> {
    const outcome = await this.preserveErrors(() =>
      this.db.transaction(async (tx) => {
        const topic = await tx
          .select({ id: topics.id })
          .from(topics)
          .where(owned(id))
          .for('update');
        if (!topic.length) return null;
        const known = await tx
          .select({ id: contentSources.id })
          .from(contentSources)
          .where(inArray(contentSources.id, ids));
        if (known.length !== ids.length) return false;
        await tx.delete(connections).where(eq(connections.topicId, id));
        if (ids.length)
          await tx
            .insert(connections)
            .values(ids.map((sourceId) => ({ topicId: id, sourceId })));
        return true;
      }),
    );
    if (outcome !== true) return outcome;
    return (await this.listDefault()).find((t) => t.id === id) ?? null;
  }
  async deleteDefault(id: string): Promise<Topic[] | null> {
    const removed = await this.preserveErrors(() =>
      this.db.transaction(async (tx) => {
        await tx
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.id, profileId))
          .for('update');
        const deleted = await tx
          .delete(topics)
          .where(owned(id))
          .returning({ id: topics.id });
        if (!deleted.length) return false;
        const ordered = tx
          .select({
            id: topics.id,
            // Window ranking preserves contiguous positions with deterministic ID ties.
            position:
              sql<number>`(row_number() over (order by ${topics.position}, ${topics.id}) - 1)::int`.as(
                'position',
              ),
          })
          .from(topics)
          .where(eq(topics.profileId, profileId))
          .as('ordered');
        await tx
          .update(topics)
          .set({
            position: sql`${sql.identifier('ordered')}.${sql.identifier('position')}`,
          })
          .from(ordered)
          .where(eq(topics.id, ordered.id));
        return true;
      }),
    );
    return removed ? this.listDefault() : null;
  }
  async createDefault(input: TopicUpdate): Promise<Topic> {
    const id = randomUUID();
    await this.preserveErrors(() =>
      this.db.transaction(async (tx) => {
        await tx
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.id, profileId))
          .for('update');
        const [last] = await tx
          .select({ position: max(topics.position) })
          .from(topics)
          .where(eq(topics.profileId, profileId));
        await tx.insert(topics).values({
          ...input,
          id,
          profileId,
          position: (last.position ?? -1) + 1,
          accounts: input.accounts ?? [],
          redditCommunities: input.redditCommunities ?? [],
        });
      }),
    );
    return (await this.listDefault()).find((t) => t.id === id)!;
  }
  async reorderDefault(ids: string[]): Promise<boolean> {
    return this.preserveErrors(() =>
      this.db.transaction(async (tx) => {
        await tx
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.id, profileId))
          .for('update');
        const current = await tx
          .select({ id: topics.id })
          .from(topics)
          .where(eq(topics.profileId, profileId))
          .orderBy(topics.id)
          .for('update');
        if (
          current.length !== ids.length ||
          current.some((row) => !ids.includes(row.id))
        )
          return false;
        // WITH ORDINALITY provides the atomic bulk ordering update without per-row writes.
        const ordering = sql`unnest(${sql.param(ids)}::uuid[]) with ordinality as ordering(id, ordinality)`;
        await tx
          .update(topics)
          .set({ position: sql`(ordering.ordinality - 1)::int` })
          .from(ordering)
          .where(
            and(sql`${topics.id}=ordering.id`, eq(topics.profileId, profileId)),
          );
        return true;
      }),
    );
  }
  async updateDefault(id: string, update: TopicUpdate): Promise<Topic | null> {
    const changed = await this.preserveErrors(() =>
      this.db
        .update(topics)
        .set(update)
        .where(owned(id))
        .returning({ id: topics.id }),
    );
    if (!changed.length) return null;
    return (await this.listDefault()).find((t) => t.id === id) ?? null;
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
