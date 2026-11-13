// Export retained BullMQ results using Redis reads only. No collection or writes.
import assert from 'node:assert/strict';

import { redis } from '../apps/api/src/libs/db/connections';

async function main() {
  assert.equal(process.argv.length, 2, 'No arguments supported');
  const client = redis();
  try {
    // Same fixed local Redis database and default BullMQ prefix as scheduled-social.
    // Retention is shared with other social jobs; this is not a complete archive.
    const prefix = 'bull:social-collection';
    const runs = [];
    for (const state of ['completed', 'failed'] as const) {
      const ids = await client.zrevrange(`${prefix}:${state}`, 0, 47);
      for (const id of ids) {
        const [name, raw, started, finished, failedReason] = await client.hmget(
          `${prefix}:${id}`,
          'name',
          'returnvalue',
          'processedOn',
          'finishedOn',
          'failedReason',
        );
        if (name !== 'collect-bluesky') continue;
        const result: unknown = raw ? JSON.parse(raw) : null;
        // Preserve actual query/window/count fields, without projecting topic
        // metadata backwards or treating fetched/submitted counts as unique posts.
        runs.push({
          id,
          state,
          startedAt: started ? new Date(Number(started)).toISOString() : null,
          finishedAt: finished
            ? new Date(Number(finished)).toISOString()
            : null,
          result,
          // Failed results may be absent: partial topic work cannot be inferred.
          failureRecorded: Boolean(failedReason),
        });
      }
    }
    runs.sort((a, b) => (a.finishedAt ?? '').localeCompare(b.finishedAt ?? ''));
    console.log(
      JSON.stringify({
        capturedAt: new Date().toISOString(),
        source: 'retained BullMQ social-collection results',
        limitations:
          'Up to 48 completed and 48 failed social jobs, shared with non-Bluesky collection. Retention and concurrent pruning can omit runs; this is not proof of a complete day. Counts are fetched/submitted, not unique, safe or relevant posts. Failed runs do not expose partial results. Save this export separately before retention expires.',
        runs,
      }),
    );
  } finally {
    await client.quit();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Report failed');
  process.exitCode = 1;
});
