import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import {
  adminAuditLog,
  loginCodes,
  sessions,
  signInLinks,
  users,
} from '../../../libs/db/schema';
import {
  AccountDeletionCleanup,
  AccountDeletionRepository,
} from '../domain/account-deletion';
import { RecipientCoordination } from '../domain/recipient-coordination';

// Prepared only: no account route or runtime registers this adapter.
@Injectable()
export class PostgresAccountDeletionRepository
  extends AccountDeletionRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  constructor(
    private readonly cleanup: AccountDeletionCleanup,
    private readonly coordination: RecipientCoordination,
  ) {
    super();
  }

  async deleteForSession(tokenHash: string): Promise<boolean> {
    // Resolve only the lock key here; authorization is rechecked after waiting.
    const [recipient] = await this.db
      .select({ email: users.email })
      .from(users)
      .innerJoin(sessions, eq(sessions.userId, users.id))
      .where(eq(sessions.tokenHash, tokenHash));
    if (!recipient) return false;
    return this.coordination.run(recipient.email, () =>
      this.deleteCoordinated(tokenHash),
    );
  }

  private async deleteCoordinated(tokenHash: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      // Lock the identity first, so requests from different devices serialize.
      const [owner] = await tx
        .select({ id: users.id, email: users.email })
        .from(users)
        .innerJoin(sessions, eq(sessions.userId, users.id))
        .where(eq(sessions.tokenHash, tokenHash))
        .for('update', { of: users });
      if (!owner) return false;
      // Recheck after waiting for the identity lock: logout may have revoked it.
      const [session] = await tx
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.tokenHash, tokenHash))
        .for('update');
      if (!session) return false;
      // Fail closed before deleting the identity. Cleanup cannot be rolled back;
      // if the transaction later fails, a retry must tolerate missing files.
      await this.cleanup.remove(owner.email);
      await tx.delete(loginCodes).where(eq(loginCodes.email, owner.email));
      await tx.delete(signInLinks).where(eq(signInLinks.email, owner.email));
      await tx
        .delete(adminAuditLog)
        .where(eq(adminAuditLog.recipientEmail, owner.email));
      // Existing foreign keys cascade sessions and audit rows issued by this user.
      await tx.delete(users).where(eq(users.id, owner.id));
      return true;
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
