import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { Pool } from 'pg';
import { z } from 'zod';

export async function applyMigrations(
  pool: Pool,
  historicalDirectory = resolve(process.cwd(), 'migrations'),
  generatedDirectory = resolve(process.cwd(), 'drizzle'),
) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(756281)');
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    for (const name of (await readdir(historicalDirectory))
      .filter((n) => n.endsWith('.sql'))
      .sort()) {
      const existing = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name=$1',
        [name],
      );
      if (existing.rowCount) continue;
      await client.query(
        await readFile(resolve(historicalDirectory, name), 'utf8'),
      );
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [
        name,
      ]);
      console.log('Applied', name);
    }
    const journal = z
      .object({
        entries: z.array(
          z.object({ tag: z.string().regex(/^\d+_[a-zA-Z0-9_-]+$/) }),
        ),
      })
      .parse(
        JSON.parse(
          await readFile(
            resolve(generatedDirectory, 'meta/_journal.json'),
            'utf8',
          ),
        ),
      );
    for (const { tag } of journal.entries) {
      const name = `drizzle/${tag}.sql`;
      const existing = await client.query(
        'SELECT 1 FROM schema_migrations WHERE name=$1',
        [name],
      );
      if (existing.rowCount) continue;
      await client.query(
        await readFile(resolve(generatedDirectory, `${tag}.sql`), 'utf8'),
      );
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [
        name,
      ]);
      console.log('Applied', name);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
