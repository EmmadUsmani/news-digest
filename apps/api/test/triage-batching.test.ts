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
    assert.equal(
      Object.values(row.inputComposition).reduce(
        (sum, value) => sum + value,
        0,
      ),
      row.inputBytes,
    );
    assert.ok(row.inputComposition.framing > 0);
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

void test('composition counts serialized Unicode and escapes in the actual wire input', async () => {
  const row = await evaluateTriageBatching(
    { id: 'test', name: 'test', description: '', guidance: '' },
    [
      { id: 'one', title: 'A"界', excerpt: 'line\n界', sources: ['Outlet'] },
      { id: 'two', title: 'Other', excerpt: null, sources: [] },
    ],
    25,
  );
  const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value));
  assert.equal(row.inputComposition.excerpts, bytes('line\n界') + bytes(null));
  assert.equal(row.inputComposition.titles, bytes('A"界') + bytes('Other'));
  assert.equal(row.inputComposition.sources, bytes(['Outlet']) + bytes([]));
  assert.equal(
    Object.values(row.inputComposition).reduce((sum, value) => sum + value, 0),
    row.inputBytes,
  );
});
