// Read-only phase-2 prerequisite. No provider calls or preference writes.
import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';
import {
  auditBookmarkIdentity,
  type IdentityEdition,
} from './lib/bookmark-identity';

async function main() {
  logger.level = 'silent';
  const db = database();
  const client = await db.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout = '15s'");
    const { rows } = await client.query<
      IdentityEdition & { scheduled_key: string | null; created_at: string }
    >(
      `SELECT id, snapshot, scheduled_key, created_at::text
       FROM digest_previews ORDER BY created_at, id`,
    );
    console.log(
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          allStored: auditBookmarkIdentity(rows),
          explicitIntegration: auditBookmarkIdentity(
            rows.filter((r) => r.scheduled_key?.startsWith('integration:')),
          ),
          otherStored: auditBookmarkIdentity(
            rows.filter((r) => !r.scheduled_key?.startsWith('integration:')),
          ),
          // Regular daily editions after the Nov 1–2 development period. This is
          // an evidence cohort, not a decision about archive publication.
          dailyNov3Onward: auditBookmarkIdentity(
            rows.filter(
              (r) =>
                r.scheduled_key &&
                !r.scheduled_key.startsWith('integration:') &&
                r.created_at >= '2026-11-03',
            ),
          ),
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
    'Bookmark identity audit failed; check database access and snapshot structure',
  );
  process.exitCode = 1;
});
