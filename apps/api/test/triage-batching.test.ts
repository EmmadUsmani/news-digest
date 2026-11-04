import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateTriageBatching,
  recordedTriageBatching,
} from '../scripts/evaluate-triage-batching';

void test('recorded batch comparison preserves candidates and cache across partitions', async () => {
  const rows = await recordedTriageBatching();
  assert.equal(rows.length, 12);
  for (const row of rows) {
    assert.equal(row.scoredItems, row.candidates);
    assert.equal(row.repeatRequests, 0);
    const baseline = rows.find(
      (r) => r.topic === row.topic && r.chunkSize === 200,
    )!;
    assert.ok(row.requests >= baseline.requests);
    assert.ok(row.inputBytes >= baseline.inputBytes);
    assert.ok(row.maximumInputBytes + 2048 <= 60000);
  }
});

void test('byte limit splits large excerpts even below caller chunk size', async () => {
  const topic = { id: 'test', name: 'test', description: '', guidance: '' };
  const candidates = Array.from({ length: 50 }, (_, i) => ({
    id: String(i),
    title: 'Long text',
    excerpt: '界'.repeat(1800),
    sources: [],
  }));
  const row = await evaluateTriageBatching(topic, candidates, 50);
  assert.ok(row.requests > 1);
  assert.equal(row.scoredItems, 50);
  assert.equal(row.repeatRequests, 0);
  assert.ok(row.maximumInputBytes + 2048 <= 60000);
  for (const size of [0, 201, 1.5, NaN])
    await assert.rejects(
      evaluateTriageBatching(topic, candidates, size),
      /Chunk size/,
    );
  await assert.rejects(
    evaluateTriageBatching(topic, [candidates[0], candidates[0]], 25),
    /Duplicate/,
  );
  assert.equal((await evaluateTriageBatching(topic, [], 25)).requests, 0);
});
