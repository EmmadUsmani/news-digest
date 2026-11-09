import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

import { insertAdminWriteAdmission } from '../../../libs/db/admin-write-admission';
import { database } from '../../../libs/db/connections';
import type { RecordAdminWrite } from '../../../public-access';

// Prepared only: public authorization must explicitly receive this recorder.
@Injectable()
export class PostgresAdminWriteAdmissionRepository implements OnModuleDestroy {
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  readonly record: RecordAdminWrite = async (entry) => {
    await insertAdminWriteAdmission(this.db, entry);
  };

  async onModuleDestroy() {
    await this.pool.end();
  }
}
