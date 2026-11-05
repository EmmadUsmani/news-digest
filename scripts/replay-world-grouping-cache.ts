// Explicit read-only cache probe; no provider, budget ledger or cache writes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { database } from '../apps/api/src/libs/db/connections';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { llmFingerprint } from '../apps/api/src/modules/curation/application/llm-fingerprint';
import {
  type Candidate,
  rank,
} from '../apps/api/src/modules/digests/domain/rank';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--read-only-cache']);
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-story-pool-2026-11-04-05.json',
      'utf8',
    ),
  ) as {
    windows: {
      editionId: string;
      topicId: string;
      windowStart: string;
      windowEnd: string;
      candidates: Candidate[];
      scores: { id: string; relevance: number; importance: number }[];
    }[];
  };
  const db = database();
  const client = await db.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '10s'");
    for (const window of fixture.windows) {
      const ordered = [...window.scores]
        .filter((s) => s.relevance >= 6 && s.importance >= 4)
        .sort(
          (a, b) =>
            b.importance - a.importance ||
            b.relevance - a.relevance ||
            a.id.localeCompare(b.id),
        )
        .map((s) => window.candidates.find((c) => c.id === s.id)!);
      for (const size of [10, 40]) {
        const pool = ordered.slice(0, size);
        assert.equal(pool.length, size);
        assert.ok(pool.every(Boolean));
        let status = 'not-requested';
        let cacheReadFailed = false;
        const grouping = new EventGrouping(
          {
            async json<T>(
              request: Parameters<typeof llmFingerprint>[0],
              validate: (value: unknown) => T,
            ): Promise<T | null> {
              const result = await client
                .query<{ response: unknown }>(
                  'SELECT response FROM llm_cache WHERE cache_key=$1',
                  [llmFingerprint(request)],
                )
                .catch(() => {
                  cacheReadFailed = true;
                  throw new Error('Cache read failed');
                });
              if (!result.rows.length) {
                status = 'cache-miss';
                return null;
              }
              try {
                const parsed = validate(result.rows[0].response);
                status = 'validated-cache-hit';
                return parsed;
              } catch {
                status = 'invalid-cache-hit';
                return null;
              }
            },
          },
          llmConfig().haiku,
        );
        const groups = await grouping.group(
          window.topicId,
          pool.map((c) => ({
            ...c,
            topicId: window.topicId,
            outlet: c.sources.join(', '),
          })),
          'verification-cache-only',
        );
        if (cacheReadFailed) throw new Error('Read-only cache replay failed');
        const memberships = new Map(
          groups.flatMap((g, i) => g.map((id) => [id, i] as const)),
        );
        const ranked = rank(
          pool,
          new Date(window.windowStart),
          new Date(window.windowEnd),
          10,
          (a, b) =>
            memberships.has(a.id) &&
            memberships.get(a.id) === memberships.get(b.id),
        );
        console.log(
          JSON.stringify({
            editionId: window.editionId,
            poolArticles: size,
            status,
            modelGroups:
              status === 'validated-cache-hit' ? groups.length : null,
            editorCandidates:
              status === 'validated-cache-hit' ? ranked.length : null,
          }),
        );
      }
    }
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Cache replay failed; expected --read-only-cache and a reachable database',
  );
  process.exitCode = 1;
});
