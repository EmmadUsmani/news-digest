import { database } from './connections';
import { applyMigrations } from './migration-runner';

async function migrate() {
  const pool = database();
  try {
    await applyMigrations(pool);
  } finally {
    await pool.end();
  }
}
void migrate().catch(() => {
  console.error('Migration failed; check local database configuration');
  process.exitCode = 1;
});
