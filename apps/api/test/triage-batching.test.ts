import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateTriageBatching,
  recordedTriageBatching,
  suppliedTriageBatching,
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
  assert.deepEqual(large.batchItemsPerPass, [[50, 50, 50, 50], [1]]);
  assert.equal(large.observedFakePeakRequests, 4);
  assert.deepEqual(large.batchFill, {
    fullItemLimit: 4,
    belowItemLimit: 1,
    minimumItems: 1,
    maximumItems: 50,
  });
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
  assert.deepEqual(empty.batchItemsPerPass, []);
  assert.equal(empty.observedFakePeakRequests, 0);
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

void test('supplied social pools use social instructions and retain every candidate across partitions', async () => {
  const topic = {
    id: 'social',
    name: 'Social',
    description: 'Demos',
    guidance: 'Original posts',
  };
  const candidates = Array.from({ length: 101 }, (_, i) => ({
    id: `bluesky:synthetic-${i}`,
    title: 'Official Bluesky API post observation',
    excerpt: 'Synthetic demo with \"quotes\" and 界',
    sources: [],
  }));
  const rows = await suppliedTriageBatching({
    kind: 'social',
    topic,
    candidates,
  });
  for (const row of rows) {
    assert.equal(row.kind, 'social');
    assert.deepEqual(row.purposes, ['social-triage-v1']);
    assert.equal(row.scoredItems, candidates.length);
    assert.equal(row.repeatRequests, 0);
    assert.equal(
      Object.values(row.inputComposition).reduce((a, b) => a + b, 0),
      row.inputBytes,
    );
  }
  assert.deepEqual(rows[3].requestsPerPass, [3]);
  assert.deepEqual(rows[3].batchItemsPerPass, [[50, 50, 1]]);
  assert.equal(rows[3].observedFakePeakRequests, 3);
  const article = await evaluateTriageBatching(topic, candidates, 200);
  assert.deepEqual(article.purposes, ['candidate-triage-v1']);
  assert.notEqual(
    rows[3].inputComposition.instructions,
    article.inputComposition.instructions,
  );
  const warm = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    candidates.map((c) => c.id),
    'social',
  );
  assert.equal(warm.requests, 0);
  assert.equal(warm.preparation.scoredItems, candidates.length);
  for (const invalid of [
    { kind: 'unknown', topic, candidates },
    { kind: 'social', topic, candidates: [...candidates, candidates[0]] },
    { kind: 'social', topic, candidates: [{ ...candidates[0], excerpt: 42 }] },
  ])
    await assert.rejects(suppliedTriageBatching(invalid));
});

void test('supplied warm social pools expose fragmentation without counting preparation as dispatch', async () => {
  const topic = { id: 'social', name: 'Social', description: '', guidance: '' };
  const candidates = Array.from({ length: 200 }, (_, i) => ({
    id: `synthetic-${i}`,
    title: 'Synthetic post',
    excerpt: null,
    sources: [],
  }));
  const warmedIds = candidates.filter((_, i) => i % 2 === 0).map((p) => p.id);
  const rows = await suppliedTriageBatching({
    kind: 'social',
    topic,
    candidates,
    warmedIds,
  });
  const small = rows.find((row) => row.chunkSize === 50)!;
  const large = rows.find((row) => row.chunkSize === 200)!;
  assert.deepEqual(small.batchItemsPerPass, [[25], [25], [25], [25]]);
  assert.equal(small.observedFakePeakRequests, 1);
  assert.deepEqual(large.batchItemsPerPass, [[50, 50]]);
  assert.equal(large.observedFakePeakRequests, 2);
  for (const row of rows) {
    assert.equal(row.scoredItems, 100);
    assert.equal(row.preparation.scoredItems, 100);
    assert.equal(row.combined.scoredItems, 200);
    assert.equal(row.repeatRequests, 0);
  }
  const warm = (
    await suppliedTriageBatching({
      kind: 'social',
      topic,
      candidates,
      warmedIds: candidates.map((p) => p.id),
    })
  )[3];
  assert.equal(warm.observedFakePeakRequests, 0);
  assert.deepEqual(warm.batchItemsPerPass, [[]]);
  assert.equal(warm.batchFill.maximumItems, 0);
  for (const invalid of [['unknown'], ['synthetic-0', 'synthetic-0']])
    await assert.rejects(
      suppliedTriageBatching({
        kind: 'social',
        topic,
        candidates,
        warmedIds: invalid,
      }),
      /Warm IDs/,
    );
});

void test('long Unicode context and excerpts expose byte-limited batches and repeated context', async () => {
  const topic = {
    id: 'unicode',
    name: 'Topic',
    description: '界'.repeat(3000),
    guidance: '界'.repeat(3000),
  };
  const candidates = Array.from({ length: 50 }, (_, i) => ({
    id: String(i),
    title: 'Post',
    excerpt: '界'.repeat(1800),
    sources: [],
  }));
  const row = await evaluateTriageBatching(
    topic,
    candidates,
    200,
    [],
    'social',
  );
  assert.ok(row.requests > 1);
  assert.equal(row.batchFill.fullItemLimit, 0);
  assert.ok(row.maximumConservativeInputBytes <= 60000);
  assert.equal(row.scoredItems, 50);
  assert.equal(row.repeatRequests, 0);
  const compactTopic = {
    ...topic,
    description: topic.description.slice(0, 2000),
    guidance: topic.guidance.slice(0, 2000),
  };
  assert.equal(
    row.inputComposition.topic,
    Buffer.byteLength(JSON.stringify(compactTopic)) * row.requests,
  );
  assert.equal(
    Object.values(row.inputComposition).reduce((sum, n) => sum + n, 0),
    row.inputBytes,
  );
  const short = await evaluateTriageBatching(
    { ...topic, description: '', guidance: '' },
    candidates,
    200,
    [],
    'social',
  );
  assert.ok(short.requests < row.requests);
  assert.ok(short.inputComposition.topic < row.inputComposition.topic);
  const empty = await evaluateTriageBatching(topic, [], 200);
  assert.equal(empty.maximumConservativeInputBytes, 0);
  assert.equal(empty.inputComposition.topic, 0);
});
