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
    try {
      const result = await client.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_lock($1) AS acquired',
        [lockId],
      );
      if (!result.rows[0].acquired) {
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
        await client.query('SELECT pg_advisory_unlock($1)', [lockId]);
      } catch (error) {
        dispose(true);
        throw error;
      }
      dispose();
    };
  }
}
