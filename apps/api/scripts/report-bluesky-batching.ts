// Read-only stored observations; scoring uses the offline fake, never a provider.
import { relevancePolicySchema } from '@digest/contracts';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { database } from '../src/libs/db/connections';
import { topics } from '../src/libs/db/schema';
import { readBlueskyObservations } from '../src/modules/social/database/bluesky.repository';
import { rankSafeBlueskyPosts } from '../src/modules/social/domain/bluesky-ranking';
import { evaluateTriageBatching } from './evaluate-triage-batching';

async function main() {
  const start = new Date(process.argv[2]);
  const end = new Date(process.argv[3]);
  if (
    process.argv.length !== 4 ||
    ![start, end].every((date) => Number.isFinite(date.getTime())) ||
    start >= end
  )
    throw new Error('Expected START END timestamps');
  const pool = database();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await client.query("SET LOCAL statement_timeout = '15s'");
      const enabled = await drizzle(client)
        .select()
        .from(topics)
        .where(
          and(
            eq(topics.profileId, '00000000-0000-4000-8000-000000000001'),
            eq(topics.enabled, true),
          ),
        )
        .orderBy(topics.position, topics.id);
      const results = [];
      for (const topic of enabled) {
        const observations = await readBlueskyObservations(
          client,
          topic.id,
          start,
          end,
          end,
        );
        const candidates = rankSafeBlueskyPosts(
          observations,
          relevancePolicySchema.parse(topic.relevancePolicy),
          start,
          end,
          topic.postBudget > 0 ? 50 : 0,
        ).map(({ post }) => ({
          id: `bluesky:${post.externalId}`,
          title: 'Official Bluesky API post observation',
          excerpt: post.text,
          sources: [],
        }));
        const context = {
          id: topic.id,
          name: topic.name,
          description: topic.description,
          guidance: `${topic.includeGuidance}\nExclude: ${topic.excludeGuidance}`,
        };
        const batching = [];
        for (const size of [10, 25, 50, 200])
          batching.push(
            await evaluateTriageBatching(
              context,
              candidates,
              size,
              [],
              'social',
            ),
          );
        results.push({
          topic: topic.name,
          observations: observations.length,
          batching,
        });
      }
      await client.query('ROLLBACK');
      console.log(
        JSON.stringify({
          start: start.toISOString(),
          end: end.toISOString(),
          note: 'Stored Bluesky observations at or before END, current topic settings and production safety/ranking shortlist (maximum 50). Cold in-memory cache and synthetic scores only; not the historical edition pool or actual cache state. No text or post IDs output, provider calls, cache writes, latency/cost/quality prediction or runtime change. Observation query limit is 5,000 per topic; a saturated count may omit observations.',
          results,
        }),
      );
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

void main().catch(() => {
  console.error('Bluesky batching report failed; check START END and database');
  process.exitCode = 1;
});
