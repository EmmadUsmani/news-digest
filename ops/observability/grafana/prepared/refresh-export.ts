// PREPARED ONLY: caller supplies a connection to the dedicated export instance.
// Never register this against the application pool. No credentials or transport here.
import type { Pool } from 'pg';

export interface ExportSnapshot {
  days: {
    day: string;
    editions: number;
    topics: number;
    stories: number;
    posts: number;
  }[];
  sources: number;
  enabled: number;
  errors: number;
}

export async function refreshExport(
  pool: Pool,
  snapshot: ExportSnapshot,
  now = new Date(),
) {
  const integer = (value: number) => Number.isSafeInteger(value) && value >= 0;
  const today = Date.parse(now.toISOString().slice(0, 10));
  const seen = new Set<string>();
  if (
    snapshot.days.length > 30 ||
    ![snapshot.sources, snapshot.enabled, snapshot.errors].every(integer) ||
    snapshot.sources > 2147483647 ||
    snapshot.enabled > snapshot.sources ||
    snapshot.errors > snapshot.enabled
  )
    throw new Error('Invalid aggregate snapshot');
  for (const row of snapshot.days) {
    const day = Date.parse(row.day);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(row.day) ||
      !Number.isFinite(day) ||
      new Date(day).toISOString().slice(0, 10) !== row.day ||
      day > today ||
      day < today - 29 * 86400000 ||
      seen.has(row.day) ||
      ![row.editions, row.topics, row.stories, row.posts].every(integer)
    )
      throw new Error('Invalid aggregate day');
    seen.add(row.day);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serialize replacement so competing refreshes cannot mix snapshots.
    await client.query(
      'LOCK TABLE grafana_public.published_editions, grafana_public.published_content, grafana_public.source_summary IN EXCLUSIVE MODE',
    );
    await client.query('DELETE FROM grafana_public.published_content');
    await client.query('DELETE FROM grafana_public.published_editions');
    await client.query('DELETE FROM grafana_public.source_summary');
    for (const row of snapshot.days) {
      await client.query(
        'INSERT INTO grafana_public.published_editions VALUES ($1,$2)',
        [row.day, row.editions],
      );
      await client.query(
        'INSERT INTO grafana_public.published_content VALUES ($1,$2,$3,$4)',
        [row.day, row.topics, row.stories, row.posts],
      );
    }
    await client.query(
      'INSERT INTO grafana_public.source_summary VALUES (true,$1,$2,$3)',
      [snapshot.sources, snapshot.enabled, snapshot.errors],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
