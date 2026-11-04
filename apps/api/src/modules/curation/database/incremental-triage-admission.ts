import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import type { IncrementalTriageAdmission } from '../application/incremental-triage-runner';

// Separate from the budget lock: never hold a budget transaction during HTTP.
const lockId = 756283;

export class PostgresIncrementalTriageAdmission implements IncrementalTriageAdmission {
  constructor(private readonly db: Pool) {}

  async acquire() {
    const client = await this.db.connect();
    // Checked-out clients do not forward errors to the pool. Keep a listener
    // during provider work so session loss cannot become an uncaught error.
    let sessionError: Error | undefined;
    const onError = (error: Error) => {
      sessionError = error;
    };
    client.on('error', onError);
    const dispose = (destroy = false) => {
      client.release(destroy);
      client.removeListener('error', onError);
    };
    // Advisory locks remain PostgreSQL function expressions in typed projections.
    // Bind Drizzle to this checked-out client so acquisition and release share it.
    const session = drizzle(client);
    try {
      const [result] = await session
        .select({
          acquired: sql<boolean>`pg_try_advisory_lock(${lockId})`,
        })
        .from(sql`(values (1)) as singleton(value)`);
      if (!result.acquired) {
        dispose();
        return null;
      }
    } catch (error) {
      dispose(true);
      throw error;
    }
    let released = false;
    return async () => {
      if (released) return;
      released = true;
      try {
        if (sessionError) throw sessionError;
        await session
          .select({
            unlocked: sql<boolean>`pg_advisory_unlock(${lockId})`,
          })
          .from(sql`(values (1)) as singleton(value)`);
      } catch (error) {
        dispose(true);
        throw error;
      }
      dispose();
    };
  }
}
