import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { users } from '../../../libs/db/schema';
import { ReaderIdentityRepository } from '../domain/identity';

// Prepared only; no runtime module registers this adapter.
@Injectable()
export class PostgresReaderIdentityRepository
  extends ReaderIdentityRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async exists(email: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows.length > 0;
  }

  async findOrCreateVerified(email: string, now: Date): Promise<string> {
    return this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ email, createdAt: now.toISOString() })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id });
      if (created) return created.id;
      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email));
      if (!existing) throw new Error('Verified identity unavailable');
      return existing.id;
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
