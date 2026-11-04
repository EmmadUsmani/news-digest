import type { Pool } from 'pg';

import type { IncrementalTriageAdmission } from '../application/incremental-triage-runner';

// Separate from the budget lock: never hold a budget transaction during HTTP.
const lockId = 756283;

export class PostgresIncrementalTriageAdmission implements IncrementalTriageAdmission {
  constructor(private readonly db: Pool) {}

  async acquire() {
    const client = await this.db.connect();
    try {
      const result = await client.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_lock($1) AS acquired',
        [lockId],
      );
      if (!result.rows[0].acquired) {
        client.release();
        return null;
      }
    } catch (error) {
      client.release(true);
      throw error;
    }
    let released = false;
    return async () => {
      if (released) return;
      released = true;
      try {
        await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
        client.release();
      } catch (error) {
        client.release(true);
        throw error;
      }
    };
  }
}
