import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { RecipientCoordination } from '../domain/recipient-coordination';

// Prepared only. Separate account adapters share this transaction-scoped lock
// across processes; their own writes still use their own transactions.
@Injectable()
export class PostgresRecipientCoordination
  extends RecipientCoordination
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async run<T>(email: string, work: () => Promise<T>): Promise<T> {
    if (
      email !== email.trim().toLowerCase() ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
      throw new Error('Recipient coordination requires a normalized email');
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`set local lock_timeout = '5s'`);
      // Hash inside PostgreSQL: no recipient is stored in the lock table.
      // A hash collision merely serializes unrelated recipients.
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtextextended(${`accounts:recipient:v1:${email}`}, 0))`,
      );
      return work();
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
