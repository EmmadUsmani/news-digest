import { eq, sql } from 'drizzle-orm';
import type { Pool } from 'pg';

import { withAdminWriteAdmission } from '../../../libs/db/admin-write-admission';
import { profiles, topics } from '../../../libs/db/schema';
import type { AdminWriteAdmission } from '../../../public-access';

class TopicNotFound extends Error {}
class TopicCatalogChanged extends Error {}

export type TopicWriteResult =
  | { outcome: 'changed' | 'unchanged'; id: string; enabled: boolean }
  | { outcome: 'not-found' };

// Prepared only; caller authorizes the actor and owns the pool. Do not combine
// with the standalone middleware recorder: this transaction owns admission.
export class PublicTopicWriter {
  constructor(private readonly pool: Pool) {}

  // Prepared only: system catalog ordering, without invoking the legacy controller.
  async reorder(
    entry: AdminWriteAdmission,
    ids: string[],
  ): Promise<{ outcome: 'changed' | 'unchanged' | 'catalog-changed' }> {
    if (
      entry.action !== 'PUT' ||
      entry.target !== '/api/admin/topics/order' ||
      !Array.isArray(ids) ||
      ids.length > 1000 ||
      new Set(ids).size !== ids.length ||
      ids.some(
        (id) =>
          typeof id !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
            id,
          ),
      )
    )
      throw new Error('Invalid topic order');
    try {
      return await withAdminWriteAdmission(
        this.pool,
        entry,
        async (tx) => {
          // Share the legacy catalog lock with topic creation/deletion/reordering.
          await tx
            .select({ id: profiles.id })
            .from(profiles)
            .where(eq(profiles.id, '00000000-0000-4000-8000-000000000001'))
            .for('update');
          const current = await tx
            .select({ id: topics.id, position: topics.position })
            .from(topics)
            .orderBy(topics.id)
            .for('update');
          if (
            current.length !== ids.length ||
            current.some((row) => !ids.includes(row.id))
          )
            throw new TopicCatalogChanged();
          const positions = new Map(ids.map((id, position) => [id, position]));
          if (current.every((row) => row.position === positions.get(row.id)))
            return { outcome: 'unchanged' as const };
          // WITH ORDINALITY performs the complete ordering in one update.
          const ordering = sql`unnest(${sql.param(ids)}::uuid[]) with ordinality as ordering(id, ordinality)`;
          await tx
            .update(topics)
            .set({ position: sql`(ordering.ordinality - 1)::int` })
            .from(ordering)
            .where(sql`${topics.id}=ordering.id`);
          return { outcome: 'changed' as const };
        },
        (result) => result.outcome,
      );
    } catch (error) {
      if (error instanceof TopicCatalogChanged)
        return { outcome: 'catalog-changed' };
      throw error;
    }
  }

  async setEnabled(
    entry: AdminWriteAdmission,
    id: string,
    enabled: boolean,
  ): Promise<TopicWriteResult> {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        id,
      ) ||
      typeof enabled !== 'boolean' ||
      entry.action !== 'PUT' ||
      entry.target !== `/api/admin/topics/${id}/enabled`
    )
      throw new Error('Invalid topic write');
    try {
      return await withAdminWriteAdmission(
        this.pool,
        entry,
        async (tx) => {
          // Serialize concurrent toggles so the result describes the locked value.
          const [topic] = await tx
            .select({ enabled: topics.enabled })
            .from(topics)
            .where(eq(topics.id, id))
            .for('update');
          if (!topic) throw new TopicNotFound();
          if (topic.enabled === enabled)
            return { outcome: 'unchanged' as const, id, enabled };
          await tx.update(topics).set({ enabled }).where(eq(topics.id, id));
          return { outcome: 'changed' as const, id, enabled };
        },
        (result) => result.outcome,
      );
    } catch (error) {
      // Throwing inside the transaction removes the unsuccessful admission too.
      if (error instanceof TopicNotFound) return { outcome: 'not-found' };
      throw error;
    }
  }
}
