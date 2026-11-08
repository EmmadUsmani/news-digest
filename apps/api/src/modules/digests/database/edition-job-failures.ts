import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { editionJobFailures } from '../../../libs/db/schema';
import { EditionJobFailures } from '../domain/edition-job-failures';

// Retain compatibility ownership on new records so flag-off recovery still works.
const profileId = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class PostgresEditionJobFailures
  extends EditionJobFailures
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);
  async record(id: string, durationMs: number): Promise<void> {
    // Store no exception text: provider responses and credentials stay out of history.
    await this.db
      .insert(editionJobFailures)
      .values({
        jobId: id,
        profileId,
        durationMs: Math.max(0, Math.round(durationMs)),
      })
      .onConflictDoNothing();
  }
  async find(id: string): Promise<{ durationMs: number } | null> {
    const [row] = await this.db
      .select({ durationMs: editionJobFailures.durationMs })
      .from(editionJobFailures)
      .where(
        and(
          eq(editionJobFailures.jobId, id),
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(editionJobFailures.profileId, profileId),
        ),
      );
    return row ?? null;
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
