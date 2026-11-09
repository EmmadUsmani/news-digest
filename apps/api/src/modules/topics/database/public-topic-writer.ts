import { eq } from 'drizzle-orm';
import type { Pool } from 'pg';

import { withAdminWriteAdmission } from '../../../libs/db/admin-write-admission';
import { topics } from '../../../libs/db/schema';
import type { AdminWriteAdmission } from '../../../public-access';

class TopicNotFound extends Error {}

export type TopicWriteResult =
  | { outcome: 'changed' | 'unchanged'; id: string; enabled: boolean }
  | { outcome: 'not-found' };

// Prepared only; caller authorizes the actor and owns the pool. Do not combine
// with the standalone middleware recorder: this transaction owns admission.
export class PublicTopicWriter {
  constructor(private readonly pool: Pool) {}

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
      entry.target !== `/api/admin/topics/${id}`
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
