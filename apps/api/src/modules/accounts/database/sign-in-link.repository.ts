import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { and, eq, gt, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { adminAuditLog, signInLinks } from '../../../libs/db/schema';
import { type SignInLink, SignInLinkRepository } from '../domain/sign-in-link';

// Prepared only: accounts do not register this adapter yet.
@Injectable()
export class PostgresSignInLinkRepository
  extends SignInLinkRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async issueWithAudit(link: SignInLink, issuerUserId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.insert(signInLinks).values({
        ...link,
        createdAt: link.createdAt.toISOString(),
        expiresAt: link.expiresAt.toISOString(),
      });
      await tx.insert(adminAuditLog).values({
        issuerUserId,
        action: 'sign_in_link_issued',
        recipientEmail: link.email,
        createdAt: link.createdAt.toISOString(),
      });
    });
  }

  async findRecipient(tokenHash: string, now: Date): Promise<string | null> {
    const [row] = await this.db
      .select({ email: signInLinks.email })
      .from(signInLinks)
      .where(
        and(
          eq(signInLinks.tokenHash, tokenHash),
          eq(signInLinks.consumed, false),
          lte(signInLinks.createdAt, now.toISOString()),
          gt(signInLinks.expiresAt, now.toISOString()),
        ),
      );
    return row?.email ?? null;
  }

  async consume(tokenHash: string, now: Date): Promise<string | null> {
    const [row] = await this.db
      .update(signInLinks)
      .set({ consumed: true })
      .where(
        and(
          eq(signInLinks.tokenHash, tokenHash),
          eq(signInLinks.consumed, false),
          lte(signInLinks.createdAt, now.toISOString()),
          gt(signInLinks.expiresAt, now.toISOString()),
        ),
      )
      .returning({ email: signInLinks.email });
    return row?.email ?? null;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
