// Read-only input for the offline replay; never invokes a model or creates jobs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { database } from '../apps/api/src/libs/db/connections';

export function arrivalWindow(args: string[], now = Date.now()) {
  const [start, end, directory] = args;
  const from = Date.parse(start);
  const to = Date.parse(end);
  if (
    args.length !== 3 ||
    !directory ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= to ||
    to > now ||
    to - from > 48 * 3600000
  )
    throw new Error(
      'Expected START END OUTPUT_DIRECTORY: completed window, at most 48 hours',
    );
  return {
    start: new Date(from).toISOString(),
    end: new Date(to).toISOString(),
    directory,
  };
}

async function main() {
  const options = arrivalWindow(process.argv.slice(2));
  const db = database();
  const client = await db.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '15s'");
    const topics = await client.query<{ id: string; name: string }>(
      'SELECT id,name FROM topics WHERE enabled ORDER BY position,id',
    );
    mkdirSync(options.directory, { recursive: true });
    const summaries = [];
    for (const topic of topics.rows) {
      const result = await client.query<{
        id: string;
        title: string;
        excerpt: string;
        sources: string[];
        publishedAt: Date;
        availableAt: Date;
      }>(
        `SELECT i.id,i.title,i.excerpt,array_agg(DISTINCT s.name ORDER BY s.name) AS sources,
          i.published_at AS "publishedAt",i.fetched_at AS "availableAt"
        FROM content_items i JOIN content_observations o ON o.item_id=i.id
        JOIN content_sources s ON s.id=o.source_id
        JOIN topic_source_connections c ON c.source_id=s.id
        WHERE c.topic_id=$1 AND i.published_at >= $2 AND i.published_at < $3
        GROUP BY i.id ORDER BY i.published_at,i.id`,
        [topic.id, options.start, options.end],
      );
      // Clock-skewed/future-dated publications cannot satisfy replay's arrival
      // invariant. Report them explicitly instead of inventing arrival times.
      const invalid = result.rows.filter((r) => r.availableAt < r.publishedAt);
      const candidates = result.rows.filter(
        (r) => r.availableAt >= r.publishedAt,
      );
      const path = join(options.directory, `${topic.id}.json`);
      writeFileSync(
        path,
        JSON.stringify(
          {
            topic: topic.name,
            windowStart: options.start,
            windowEnd: options.end,
            evidence: {
              exportedAt: new Date().toISOString(),
              arrival:
                'content_items.fetched_at: first global insert, not first topic observation',
              pool: 'Current source connections and current text; no historical membership or eligibility snapshots. Waste remains unknown. Uncapped source-associated pool, not production shortlist.',
              excludedArrivalBeforePublication: invalid.length,
            },
            candidates,
          },
          null,
          2,
        ) + '\n',
        { mode: 0o600, flag: 'wx' },
      );
      summaries.push({
        topic: topic.name,
        candidates: candidates.length,
        excludedArrivalBeforePublication: invalid.length,
        unavailableAtEnd: candidates.filter(
          (r) => r.availableAt.getTime() >= Date.parse(options.end),
        ).length,
        path,
      });
    }
    await client.query('COMMIT');
    console.log(
      JSON.stringify({
        windowStart: options.start,
        windowEnd: options.end,
        summaries,
      }),
    );
  } finally {
    client.release();
    await db.end();
  }
}

if (require.main === module)
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Export failed');
    process.exitCode = 1;
  });
