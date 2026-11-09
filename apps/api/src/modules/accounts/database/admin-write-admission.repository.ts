import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { adminWriteAdmissions } from '../../../libs/db/schema';
import type { RecordAdminWrite } from '../../../public-access';
import { classifyPublicRoute } from '../../../public-route-policy';

// Prepared only: public authorization must explicitly receive this recorder.
@Injectable()
export class PostgresAdminWriteAdmissionRepository implements OnModuleDestroy {
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  readonly record: RecordAdminWrite = async (entry) => {
    // Validate again at persistence; never store arbitrary paths or query data.
    if (
      !['POST', 'PUT', 'DELETE'].includes(entry.action) ||
      entry.target.includes('?') ||
      classifyPublicRoute(entry.action, entry.target) !== 'admin' ||
      !Number.isFinite(entry.at.getTime())
    )
      throw new Error('Invalid admin write admission');
    const userId = 'userId' in entry.actor ? entry.actor.userId : null;
    const localScript =
      'localScript' in entry.actor && entry.actor.localScript === true;
    if ((userId !== null) === localScript)
      throw new Error('Invalid admin actor');
    await this.db.insert(adminWriteAdmissions).values({
      userId,
      localScript,
      method: entry.action,
      target: entry.target,
      createdAt: entry.at.toISOString(),
    });
  };

  async onModuleDestroy() {
    await this.pool.end();
  }
}
