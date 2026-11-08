import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { and, eq, getTableColumns, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { sessions, users } from '../../../libs/db/schema';
import { type ReaderSession, SessionRepository } from '../domain/session';

const selection = { ...getTableColumns(sessions), email: users.email };
const mapSession = (
  row: typeof sessions.$inferSelect & { email: string },
): ReaderSession => ({
  ...row,
  createdAt: new Date(row.createdAt),
  cookieRenewedAt: new Date(row.cookieRenewedAt),
});

// Prepared only: no module registers this adapter until accounts are activated.
@Injectable()
export class PostgresSessionRepository
  extends SessionRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async create(input: {
    userId: string;
    tokenHash: string;
    adminEligible: boolean;
    now: Date;
  }): Promise<ReaderSession> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(sessions)
        .values({
          userId: input.userId,
          tokenHash: input.tokenHash,
          adminEligible: input.adminEligible,
          createdAt: input.now.toISOString(),
          cookieRenewedAt: input.now.toISOString(),
        })
        .returning();
      const [user] = await tx
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, input.userId));
      return mapSession({ ...row, email: user.email });
    });
  }

  async findByTokenHash(hash: string): Promise<ReaderSession | null> {
    const [row] = await this.db
      .select(selection)
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.tokenHash, hash));
    return row ? mapSession(row) : null;
  }

  async claimCookieRenewal(
    id: string,
    cutoff: Date,
    now: Date,
  ): Promise<boolean> {
    const rows = await this.db
      .update(sessions)
      .set({ cookieRenewedAt: now.toISOString() })
      .where(
        and(
          eq(sessions.id, id),
          lte(sessions.cookieRenewedAt, cutoff.toISOString()),
        ),
      )
      .returning({ id: sessions.id });
    return rows.length === 1;
  }

  async deleteByTokenHash(hash: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, hash));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
