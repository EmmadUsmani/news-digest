import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { editionJobRequests } from '../../../libs/db/schema';
import { EditionJobRequests } from '../domain/edition-job-requests';

// Retain compatibility ownership on new records so flag-off recovery still works.
const profileId = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class PostgresEditionJobRequests
  extends EditionJobRequests
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);
  async record(id: string): Promise<void> {
    await this.db
      .insert(editionJobRequests)
      .values({ jobId: id, profileId })
      .onConflictDoNothing();
  }
  async exists(id: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: editionJobRequests.jobId })
      .from(editionJobRequests)
      .where(
        and(
          eq(editionJobRequests.jobId, id),
          process.env.SYSTEM_OWNERSHIP === '1'
            ? undefined
            : eq(editionJobRequests.profileId, profileId),
        ),
      );
    return !!row;
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
