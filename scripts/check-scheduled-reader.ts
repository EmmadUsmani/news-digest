// Local GET-only publication gate. No jobs, provider calls or publication writes.
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

import {
  digestPreviewSchema,
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';

import { localAdminJson } from './lib/local-admin-fetch';
import { requireScheduledAiTopic } from './lib/scheduled-editorial-gate';

async function read(path: string): Promise<unknown> {
  const response = await fetch(`http://127.0.0.1:8000${path}`, {
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200, `${path}: HTTP status`);
  return response.json();
}

async function main() {
  const [expectedEnd, ...extra] = process.argv.slice(2);
  const requiredTopic =
    extra[0] === '--require-ai-topic' && extra.length === 2
      ? extra[1].trim()
      : null;
  assert.ok(
    expectedEnd &&
      (!extra.length || requiredTopic) &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(expectedEnd),
    'usage: check-scheduled-reader.ts YYYY-MM-DDTHH:mm:ssZ [--require-ai-topic NBA]',
  );
  const expected = new Date(expectedEnd).toISOString();
  assert.equal(
    expected,
    expectedEnd.replace('Z', '.000Z'),
    'invalid calendar date',
  );
  const latest = readerEditionSchema
    .nullable()
    .parse(await read('/api/editions/latest'));
  if (!latest || Date.parse(latest.windowEnd) < Date.parse(expected)) {
    console.log(
      JSON.stringify({
        status: 'pending',
        expectedWindowEnd: expected,
        latestWindowEnd: latest?.windowEnd ?? null,
      }),
    );
    process.exitCode = 2;
    return;
  }
  assert.equal(
    new Date(latest.windowEnd).toISOString(),
    expected,
    'latest reader window is newer than requested; review the requested saved edition explicitly',
  );
  const direct = readerEditionSchema.parse(
    await read(`/api/editions/${encodeURIComponent(latest.id)}`),
  );
  assert.ok(
    isDeepStrictEqual(direct, latest),
    'latest and direct reader responses differ',
  );
  const history = readerEditionHistorySchema.parse(
    await read('/api/editions?limit=20&offset=0'),
  );
  const entries = history.entries.filter((entry) => entry.id === latest.id);
  assert.equal(
    entries.length,
    1,
    'scheduled reader edition must appear exactly once in recent history',
  );
  assert.equal(
    Date.parse(entries[0].windowEnd),
    Date.parse(expected),
    'history window differs',
  );
  assert.equal(
    Date.parse(entries[0].windowStart),
    Date.parse(latest.windowStart),
    'history window start differs',
  );
  assert.ok(
    isDeepStrictEqual(
      entries[0].topics,
      latest.topics.map(({ id, name }) => ({ id, name })),
    ),
    'history topics differ',
  );
  const aiTopic = requiredTopic
    ? requireScheduledAiTopic(
        latest,
        digestPreviewSchema.parse(
          await localAdminJson(
            `/api/admin/digest-previews/${encodeURIComponent(latest.id)}`,
          ),
        ),
        requiredTopic,
      )
    : undefined;
  console.log(
    JSON.stringify({
      status: 'reader-verified',
      ...(aiTopic ? { aiTopic } : {}),
      editionId: latest.id,
      windowEnd: latest.windowEnd,
      topics: latest.topics.length,
      stories: latest.topics.reduce(
        (sum, topic) => sum + topic.stories.length,
        0,
      ),
      posts: latest.topics.reduce((sum, topic) => sum + topic.posts.length, 0),
    }),
  );
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Reader publication check failed',
  );
  process.exitCode = 1;
});
