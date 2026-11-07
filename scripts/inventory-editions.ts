// Read-only phase-0 inventory. No provider requests or publication decisions.
import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';

async function main() {
  // Keep redirected stdout valid JSON even when a SELECT crosses 250 ms.
  // This setting applies only to this standalone inventory process.
  logger.level = 'silent';
  const db = database();
  const client = await db.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout = '15s'");
    // Export structural evidence only: never article text or provider errors.
    const { rows } = await client.query<{
      id: string;
      created_at: string;
      window_start: string;
      window_end: string;
      scheduled_key: string | null;
      snapshot: Record<string, unknown>;
    }>(`SELECT id, created_at::text, window_start::text, window_end::text,
               scheduled_key, snapshot
        FROM digest_previews ORDER BY created_at, id`);
    const editions = rows.map((row) => {
      const topics = Array.isArray(row.snapshot.topics)
        ? (row.snapshot.topics as Record<string, unknown>[])
        : [];
      const count = (key: string) =>
        topics.reduce(
          (sum, topic) =>
            sum + (Array.isArray(topic[key]) ? topic[key].length : 0),
          0,
        );
      return {
        id: row.id,
        createdAt: new Date(row.created_at).toISOString(),
        windowStart: new Date(row.window_start).toISOString(),
        windowEnd: new Date(row.window_end).toISOString(),
        scheduled: row.scheduled_key !== null,
        scheduledKey: row.scheduled_key,
        topics: topics.length,
        stories: count('stories'),
        posts: count('posts'),
        rootFields: Object.keys(row.snapshot).sort(),
        topicShapes: [
          ...new Set(topics.map((t) => Object.keys(t).sort().join(','))),
        ].sort(),
      };
    });
    const days = [...new Set(editions.map((e) => e.createdAt.slice(0, 10)))];
    const daily = days.map((day) => ({
      day,
      scheduled: editions.filter(
        (e) => e.createdAt.startsWith(day) && e.scheduled,
      ).length,
      manual: editions.filter(
        (e) => e.createdAt.startsWith(day) && !e.scheduled,
      ).length,
    }));
    const scheduledDays = new Set(
      daily.filter((d) => d.scheduled > 0).map((d) => d.day),
    );
    console.log(
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          dayBasis: 'UTC created_at; windows retained for owner review',
          total: editions.length,
          scheduled: editions.filter((e) => e.scheduled).length,
          manual: editions.filter((e) => !e.scheduled).length,
          integrationKeyEditions: editions
            .filter((e) => e.scheduledKey?.startsWith('integration:'))
            .map((e) => e.id),
          daily,
          manualWithoutScheduledDay: editions.filter(
            (e) => !e.scheduled && !scheduledDays.has(e.createdAt.slice(0, 10)),
          ),
          editions,
        },
        null,
        2,
      ),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}

void main().catch(() => {
  console.error(
    'Edition inventory failed; check database access and snapshot structure',
  );
  process.exitCode = 1;
});
