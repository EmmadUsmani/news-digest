// Read-only preparation: no provider imports, admission, dispatch or cache writes.
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import {
  experimentWindow,
  prepareXExperimentTopic,
} from '../../../scripts/lib/x-experiment-inputs';
import { database } from '../src/libs/db/connections';
import { topics, xSearchTopicSettings } from '../src/libs/db/schema';
import { loadReactionStories } from '../src/modules/digests/public/reaction-stories';

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
        const stories = await loadReactionStories(
          client,
          topic.id,
          new Date(window.start),
          new Date(window.end),
        );
        prepared.push(
          prepareXExperimentTopic(topic, settings, stories, window),
        );
      }
      await client.query('ROLLBACK');
      console.log(
        JSON.stringify({
          window,
          capturedAt: new Date().toISOString(),
          note: 'Current stored article observations and topic settings; heuristic ranking, no new AI calls. Not a historical snapshot or dispatch authorization. Dispatch requires STEERING 31 authorization, the separate experiment journal and explicit live opt-in.',
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
