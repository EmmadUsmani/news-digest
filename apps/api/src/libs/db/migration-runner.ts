import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import { z } from 'zod';

import { schemaMigrations } from './schema';

export async function applyMigrations(
  pool: Pool,
  historicalDirectory = resolve(process.cwd(), 'migrations'),
  generatedDirectory = resolve(process.cwd(), 'drizzle'),
  through?: string,
) {
  const client = await pool.connect();
  const db = drizzle(client);
  try {
    // Driver SQL is limited to transaction control, bootstrap DDL and migration
    // files: the ledger does not exist until bootstrap, and files may contain
    // multiple statements that must execute together on this locked client.
    await client.query('BEGIN');
    await db
      .select({ locked: sql`pg_advisory_xact_lock(756281)` })
      .from(sql`(values (1)) as singleton(value)`);
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
    );
    for (const name of (await readdir(historicalDirectory))
      .filter((n) => n.endsWith('.sql'))
      .sort()) {
      const existing = await db
        .select({ name: schemaMigrations.name })
        .from(schemaMigrations)
        .where(eq(schemaMigrations.name, name));
      if (existing.length) continue;
      await client.query(
        await readFile(resolve(historicalDirectory, name), 'utf8'),
      );
      await db.insert(schemaMigrations).values({ name });
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
    const last =
      through === undefined
        ? journal.entries.length - 1
        : journal.entries.findIndex(({ tag }) => tag === through);
    if (last < 0 && through !== undefined) {
      throw new Error('Unknown migration stopping point');
    }
    for (const { tag } of journal.entries.slice(0, last + 1)) {
      const name = `drizzle/${tag}.sql`;
      const existing = await db
        .select({ name: schemaMigrations.name })
        .from(schemaMigrations)
        .where(eq(schemaMigrations.name, name));
      if (existing.length) continue;
      await client.query(
        await readFile(resolve(generatedDirectory, `${tag}.sql`), 'utf8'),
      );
      await db.insert(schemaMigrations).values({ name });
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
