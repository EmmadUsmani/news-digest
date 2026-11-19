// Explicit offline-feature preparation: read-only database, no model or network adapters.
import { writeFileSync } from 'node:fs';

import { type DigestPreview } from '@digest/contracts';
import { and, asc, isNotNull, lt, ne } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../src/libs/db/connections';
import { digestPreviews } from '../src/libs/db/schema';
import { logger } from '../src/libs/observability/logging';
import {
  developingHistory,
  type PublishedStoryEdition,
} from '../src/modules/digests/domain/developing-history';
import { savedEditorialEvidence } from './saved-editorial-evidence';

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--output' || !args[1])
    throw new Error(
      'Usage: tsx apps/api/scripts/prepare-developing-story-replay.ts --output file.json',
    );
  logger.level = 'silent';
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout = '15s'");
    const rows = await drizzle(client)
      .select({
        id: digestPreviews.id,
        profileId: digestPreviews.profileId,
        publishedAt: digestPreviews.publishedAt,
        windowEnd: digestPreviews.windowEnd,
        snapshot: digestPreviews.snapshot,
      })
      .from(digestPreviews)
      .where(
        and(
          isNotNull(digestPreviews.publishedAt),
          ne(digestPreviews.kind, 'test'),
          lt(digestPreviews.publishedAt, '2026-11-19T00:00:00Z'),
        ),
      )
      .orderBy(asc(digestPreviews.publishedAt), asc(digestPreviews.id));
    const editions: PublishedStoryEdition[] = rows.map((row) => ({
      id: row.id,
      profileId: row.profileId,
      publishedAt: row.publishedAt!,
      topics: (row.snapshot as DigestPreview).topics,
    }));
    const cases = rows.flatMap((row) => {
      const day = new Date(row.windowEnd).toISOString().slice(0, 10);
      if (day < '2026-11-12' || day > '2026-11-18') return [];
      return (row.snapshot as DigestPreview).topics.map((topic) => ({
        editionId: row.id,
        profileId: row.profileId,
        topicId: topic.id,
        topicName: topic.name,
        windowEnd: row.windowEnd,
        originalEditorialEvidence: savedEditorialEvidence(
          topic.editorial?.candidatePrompt,
          topic.id,
          topic.stories.map((story) => story.id),
        ),
        selected: topic.stories.map(({ id, title, summary, whyItMatters }) => ({
          id,
          title,
          summary: summary ?? '',
          whyItMatters: whyItMatters ?? '',
        })),
        stories: topic.stories.map(({ id, title, summary }) => ({
          id,
          title,
          summary: summary ?? null,
        })),
        history: developingHistory(editions, {
          id: row.id,
          profileId: row.profileId,
          publishedAt: row.publishedAt!,
          topicId: topic.id,
        }),
      }));
    });
    if (!cases.length) throw new Error('No published replay cases found');
    const report = {
      purpose:
        'Developing-story matching inputs only; no semantic matches asserted',
      window: ['2026-11-12', '2026-11-18'],
      cases,
    };
    writeFileSync(args[1], JSON.stringify(report, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
    console.log(
      JSON.stringify({
        output: args[1],
        cases: cases.length,
        originalEvidenceCases: cases.filter(
          (item) => item.originalEditorialEvidence,
        ).length,
        selectedStories: cases.reduce((n, item) => n + item.stories.length, 0),
        historyEditions: [
          ...new Set(cases.map((item) => item.history.length)),
        ].sort(),
      }),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Replay preparation failed',
  );
  process.exitCode = 1;
});
