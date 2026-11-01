import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { database } from './connections';
async function migrate() {
 const pool = database(); const client = await pool.connect();
 try {
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(756281)');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
 for (const name of (await readdir(resolve(process.cwd(), 'migrations'))).filter(n => n.endsWith('.sql')).sort()) {
 const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
 if (existing.rowCount) continue;
 await client.query(await readFile(resolve(process.cwd(), 'migrations', name), 'utf8'));
 await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
 console.log('Applied', name);
 }
 await client.query('COMMIT');
 } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); await pool.end(); }
}
void migrate().catch(() => { console.error('Migration failed; check local database configuration'); process.exitCode = 1; });
