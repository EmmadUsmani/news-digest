import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { adminAuditLog, sessions, users } from '../../../libs/db/schema';
import { SessionRevocationRepository } from '../domain/session-revocation';

const ADMIN_FRESHNESS_MS = 7 * 86_400_000;

// Constructed only when the account runtime gate is enabled.
@Injectable()
export class PostgresSessionRevocationRepository
  extends SessionRevocationRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async revokeWithAudit(input: {
    issuerTokenHash: string;
    targetUserId: string;
    adminEmails: readonly string[];
    now: Date;
  }): Promise<{ revoked: number } | null> {
    return this.db.transaction(async (tx) => {
      const [issuer] = await tx
        .select({
          userId: sessions.userId,
          eligible: sessions.adminEligible,
          createdAt: sessions.createdAt,
          email: users.email,
        })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(eq(sessions.tokenHash, input.issuerTokenHash))
        .for('update', { of: sessions });
      if (!issuer) return null;
      const age = input.now.getTime() - new Date(issuer.createdAt).getTime();
      if (
        !issuer.eligible ||
        !input.adminEmails.includes(issuer.email) ||
        !Number.isFinite(age) ||
        age < 0 ||
        age >= ADMIN_FRESHNESS_MS
      )
        return null;
      const [target] = await tx
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, input.targetUserId))
        .for('update');
      if (!target) return null;
      const removed = await tx
        .delete(sessions)
        .where(eq(sessions.userId, input.targetUserId))
        .returning({ id: sessions.id });
      await tx.insert(adminAuditLog).values({
        issuerUserId: issuer.userId,
        action: 'reader_sessions_revoked',
        recipientEmail: target.email,
        createdAt: input.now.toISOString(),
      });
      return { revoked: removed.length };
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
