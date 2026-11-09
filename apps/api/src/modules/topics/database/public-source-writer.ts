import { eq } from 'drizzle-orm';
import type { Pool } from 'pg';

import { withAdminWriteAdmission } from '../../../libs/db/admin-write-admission';
import { contentSources } from '../../../libs/db/schema';
import type { AdminWriteAdmission } from '../../../public-access';

class SourceNotFound extends Error {}

export type SourceWriteResult =
  | { outcome: 'changed' | 'unchanged'; id: string; enabled: boolean }
  | { outcome: 'not-found' };

// Prepared only; caller authorizes the actor and owns the pool. Do not combine
// with the standalone middleware recorder: this transaction owns admission.
export class PublicSourceWriter {
  constructor(private readonly pool: Pool) {}

  async setEnabled(
    entry: AdminWriteAdmission,
    id: string,
    enabled: boolean,
  ): Promise<SourceWriteResult> {
    if (
      !/^[a-zA-Z0-9_-]{1,200}$/.test(id) ||
      typeof enabled !== 'boolean' ||
      entry.action !== 'PUT' ||
      entry.target !== `/api/admin/topics/sources/${id}/enabled`
    )
      throw new Error('Invalid source write');
    try {
      return await withAdminWriteAdmission(
        this.pool,
        entry,
        async (tx) => {
          // Serialize concurrent toggles so the result describes the locked value.
          const [source] = await tx
            .select({ enabled: contentSources.enabled })
            .from(contentSources)
            .where(eq(contentSources.id, id))
            .for('update');
          if (!source) throw new SourceNotFound();
          if (source.enabled === enabled)
            return { outcome: 'unchanged' as const, id, enabled };
          await tx
            .update(contentSources)
            .set({ enabled })
            .where(eq(contentSources.id, id));
          return { outcome: 'changed' as const, id, enabled };
        },
        (result) => result.outcome,
      );
    } catch (error) {
      // Throwing inside the transaction removes the unsuccessful admission too.
      if (error instanceof SourceNotFound) return { outcome: 'not-found' };
      throw error;
    }
  }
}
