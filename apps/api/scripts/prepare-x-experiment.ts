// Read-only preparation: no provider imports, admission, dispatch or cache writes.
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import {
  experimentWindow,
  prepareViralXExperimentTopic,
} from '../../../scripts/lib/x-experiment-inputs';
import { database } from '../src/libs/db/connections';
import { topics, xSearchTopicSettings } from '../src/libs/db/schema';

async function main() {
  if (process.argv.length !== 4) throw new Error('Expected START END');
  const window = experimentWindow(process.argv[2], process.argv[3]);
  const pool = database();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await client.query("SET LOCAL statement_timeout = '15s'");
      const rows = await drizzle(client)
        .select({ topic: topics, settings: xSearchTopicSettings })
        .from(topics)
        .leftJoin(
          xSearchTopicSettings,
          eq(topics.id, xSearchTopicSettings.topicId),
        )
        .where(
          and(
            eq(topics.profileId, '00000000-0000-4000-8000-000000000001'),
            eq(topics.enabled, true),
          ),
        )
        .orderBy(topics.position, topics.id);
      const prepared = [];
      for (const { topic, settings } of rows) {
        if (!settings) throw new Error('Missing saved topic settings');
        prepared.push(prepareViralXExperimentTopic(topic, settings, window));
      }
      await client.query('ROLLBACK');
      console.log(
        JSON.stringify({
          window,
          capturedAt: new Date().toISOString(),
          note: 'Saved topic descriptions and thresholds; viral keyword plus test-only semantic requests. No article inputs or AI calls. Not dispatch authorization. Revised runner and reporting must be ready before the Nov 5/6 rounds after 21:00 UTC; existing experiment caps apply',
          topics: prepared,
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
  console.error(
    'Experiment preparation failed; check explicit START END timestamps, database and saved settings',
  );
  process.exitCode = 1;
});
