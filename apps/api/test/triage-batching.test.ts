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

void test('capacity rounds respect sequential caller passes and partial final passes', async () => {
  const topic = { id: 'test', name: 'test', description: '', guidance: '' };
  const candidates = Array.from({ length: 201 }, (_, i) => ({
    id: String(i),
    title: 'Short',
    excerpt: null,
    sources: [],
  }));
  const large = await evaluateTriageBatching(topic, candidates, 200);
  assert.deepEqual(large.requestsPerPass, [4, 1]);
  assert.deepEqual(large.equalDurationRounds, [
    { slots: 1, rounds: 5 },
    { slots: 2, rounds: 3 },
    { slots: 4, rounds: 2 },
  ]);
  const small = await evaluateTriageBatching(topic, candidates, 50);
  assert.deepEqual(small.requestsPerPass, [1, 1, 1, 1, 1]);
  assert.ok(small.equalDurationRounds.every(({ rounds }) => rounds === 5));
  const empty = await evaluateTriageBatching(topic, [], 200);
  assert.deepEqual(empty.requestsPerPass, []);
  assert.ok(empty.equalDurationRounds.every(({ rounds }) => rounds === 0));
  const byteSplit = await evaluateTriageBatching(
    topic,
    candidates
      .slice(0, 50)
      .map((candidate) => ({ ...candidate, excerpt: '界'.repeat(1800) })),
    50,
  );
  assert.ok(byteSplit.requestsPerPass[0] > 1);
  assert.equal(
    byteSplit.equalDurationRounds[2].rounds,
    Math.ceil(byteSplit.requestsPerPass[0] / 4),
  );
});

void test('warm cache placement changes caller barriers without losing remaining candidates', async () => {
  const topic = { id: 'test', name: 'test', description: '', guidance: '' };
  const candidates = Array.from({ length: 200 }, (_, i) => ({
    id: String(i),
    title: 'Short',
    excerpt: null,
    sources: [],
  }));
  const clustered = candidates.slice(0, 100).map(({ id }) => id);
  const scattered = candidates
    .filter((_, i) => i % 2 === 0)
    .map(({ id }) => id);
  const packed = await evaluateTriageBatching(topic, candidates, 50, clustered);
  const spread = await evaluateTriageBatching(topic, candidates, 50, scattered);
  assert.deepEqual(packed.requestsPerPass, [0, 0, 1, 1]);
  assert.deepEqual(spread.requestsPerPass, [1, 1, 1, 1]);
  for (const row of [packed, spread]) {
    assert.equal(row.warmedCandidates, 100);
    assert.equal(row.remainingCandidates, 100);
    assert.equal(row.scoredItems, 100);
    assert.equal(row.repeatRequests, 0);
  }
  const combined = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    scattered,
  );
  assert.deepEqual(combined.requestsPerPass, [2]);
  assert.equal(combined.equalDurationRounds[2].rounds, 1);
  const warm = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    candidates.map(({ id }) => id),
  );
  assert.equal(warm.requests, 0);
  assert.equal(warm.scoredItems, 0);
  assert.equal(warm.inputBytes, 0);
  assert.equal(warm.remainingCandidates, 0);
  for (const ids of [['missing'], ['0', '0']])
    await assert.rejects(
      evaluateTriageBatching(topic, candidates, 200, ids),
      /Warm IDs/,
    );
});

void test('warming overhead includes preparation as well as publication work', async () => {
  const topic = { id: 'test', name: 'test', description: '', guidance: '' };
  const candidates = Array.from({ length: 50 }, (_, i) => ({
    id: String(i),
    title: 'Short',
    excerpt: null,
    sources: [],
  }));
  const cold = await evaluateTriageBatching(topic, candidates, 200);
  const half = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    candidates.slice(0, 25).map(({ id }) => id),
  );
  assert.equal(cold.preparation.requests, 0);
  assert.deepEqual(cold.combined, {
    requests: cold.requests,
    scoredItems: cold.scoredItems,
    inputBytes: cold.inputBytes,
    reservedOutputTokens: cold.reservedOutputTokens,
  });
  assert.equal(half.preparation.requests, 1);
  assert.equal(half.preparation.scoredItems, 25);
  assert.equal(half.requests, 1);
  assert.equal(half.combined.requests, 2);
  assert.equal(half.combined.scoredItems, candidates.length);
  assert.equal(
    half.combined.inputBytes,
    half.preparation.inputBytes + half.inputBytes,
  );
  assert.equal(
    half.combined.reservedOutputTokens,
    half.preparation.reservedOutputTokens + half.reservedOutputTokens,
  );
  assert.ok(half.combined.inputBytes > cold.combined.inputBytes);
  const warm = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    candidates.map(({ id }) => id),
  );
  assert.equal(warm.requests, 0);
  assert.equal(warm.combined.requests, cold.requests);
  assert.equal(warm.combined.inputBytes, cold.inputBytes);
  assert.equal(warm.combined.scoredItems, candidates.length);
});
