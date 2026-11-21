// Read-only signed-out acceptance check. Never generates editions or calls a model.
import assert from 'node:assert/strict';

import {
  readerEditionSchema,
  readerWeeklyEditionSchema,
  readerWeeklyHistorySchema,
} from '@digest/contracts';

import { verifyWeeklyCoverage } from './lib/weekly-reader-gate';

async function main() {
  const [expectedEnd, ...extra] = process.argv.slice(2);
  assert.ok(
    expectedEnd && !extra.length,
    'usage: check-weekly-reader.ts YYYY-MM-DDTHH:mm:ssZ',
  );
  const expected = new Date(expectedEnd).toISOString();
  assert.equal(
    expected,
    expectedEnd.replace('Z', '.000Z'),
    'use an exact UTC cutoff',
  );
  const origin = new URL(
    process.env.SCHEDULED_READER_ORIGIN ?? 'http://127.0.0.1:8000',
  );
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(
    origin.hostname,
  );
  assert.ok(
    origin.protocol === 'https:' || (loopback && origin.protocol === 'http:'),
  );
  assert.ok(
    !origin.username &&
      !origin.password &&
      !origin.search &&
      !origin.hash &&
      origin.pathname === '/',
    'use a signed-out reader origin',
  );
  async function read(path: string): Promise<unknown> {
    const response = await fetch(`${origin.origin}${path}`, {
      headers: loopback ? { 'X-Forwarded-For': '192.0.2.169' } : {},
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
    });
    assert.equal(response.status, 200, `${path}: HTTP status`);
    return response.json();
  }
  let offset: number | null = 0;
  const seen = new Set<number>();
  let id: string | undefined;
  while (offset !== null) {
    assert.ok(!seen.has(offset), 'weekly history pagination loop');
    seen.add(offset);
    const history = readerWeeklyHistorySchema.parse(
      await read(`/api/weekly-editions?limit=100&offset=${offset}`),
    );
    id = history.entries.find(
      (entry) => Date.parse(entry.windowEnd) === Date.parse(expected),
    )?.id;
    if (id) break;
    offset = history.nextOffset;
  }
  if (!id) {
    console.log(
      JSON.stringify({
        status: 'pending',
        expectedWindowEnd: expected,
        origin: origin.origin,
      }),
    );
    process.exitCode = 2;
    return;
  }
  const weekly = readerWeeklyEditionSchema.parse(
    await read(`/api/weekly-editions/${id}`),
  );
  assert.equal(weekly.id, id);
  assert.equal(Date.parse(weekly.windowEnd), Date.parse(expected));
  const result = await verifyWeeklyCoverage(weekly, async (editionId) =>
    readerEditionSchema.parse(await read(`/api/editions/${editionId}`)),
  );
  const latest = readerEditionSchema.parse(await read('/api/editions/latest'));
  assert.ok(latest.id !== weekly.id, 'weekly edition replaced latest daily');
  console.log(
    JSON.stringify({
      status: 'weekly-reader-verified',
      origin: origin.origin,
      id,
      windowEnd: expected,
      ...result,
      latestDailyId: latest.id,
    }),
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : 'Weekly reader verification failed',
  );
  process.exitCode = 1;
});
