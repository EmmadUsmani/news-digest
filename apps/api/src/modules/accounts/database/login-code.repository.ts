import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../../../libs/db/connections';
import { loginCodes } from '../../../libs/db/schema';
import {
  type LoginCodeChallenge,
  LoginCodeRepository,
} from '../domain/login-code';

// Prepared only: accounts do not register this adapter yet.
@Injectable()
export class PostgresLoginCodeRepository
  extends LoginCodeRepository
  implements OnModuleDestroy
{
  private readonly pool = database();
  private readonly db = drizzle(this.pool);

  async replace(challenge: LoginCodeChallenge): Promise<void> {
    const row = {
      email: challenge.email,
      clientKey: challenge.clientKey ?? '',
      codeHash: challenge.codeHash,
      createdAt: challenge.createdAt.toISOString(),
      expiresAt: challenge.expiresAt.toISOString(),
      attempts: 0,
      consumed: false,
    };
    await this.db
      .insert(loginCodes)
      .values(row)
      .onConflictDoUpdate({
        target: [loginCodes.email, loginCodes.clientKey],
        set: row,
      });
  }

  async consume(
    email: string,
    now: Date,
    matches: (storedHash: string) => boolean,
    clientKey = '',
  ): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(loginCodes)
        .where(
          and(eq(loginCodes.email, email), eq(loginCodes.clientKey, clientKey)),
        )
        .for('update');
      if (
        !row ||
        row.consumed ||
        row.attempts >= 5 ||
        now < new Date(row.createdAt) ||
        now >= new Date(row.expiresAt)
      )
        return false;
      const consumed = matches(row.codeHash);
      await tx
        .update(loginCodes)
        .set({ attempts: row.attempts + 1, consumed })
        .where(
          and(eq(loginCodes.email, email), eq(loginCodes.clientKey, clientKey)),
        );
      return consumed;
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
