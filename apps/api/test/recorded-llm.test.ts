import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import {
  RecordingLlmAdapter,
  ReplayLlmAdapter,
} from '../src/modules/curation/adapters/recorded-llm';
import { llmFingerprint } from '../src/modules/curation/application/llm-fingerprint';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

const request: LlmRequest = {
  model: llmConfig({}).haiku,
  purpose: 'fixture',
  runId: 'offline',
  instructions: 'Return JSON with ok true.',
  prompt: 'Ready?',
  maxOutputTokens: 100,
};
const fixture: unknown = JSON.parse(
  readFileSync(
    new URL('./fixtures/llm/transport.synthetic.json', import.meta.url),
    'utf8',
  ),
);
void test('fingerprinted replay uses the stable cache key and ignores billing metadata', async () => {
  assert.equal(
    llmFingerprint(request),
    '1ef685dd911142b4617b0361ec4044ac2c9267f97170fe7ec8b4e9724fcc7ddc',
  );
  const replay = new ReplayLlmAdapter(fixture);
  const result = await replay.complete({
    ...request,
    runId: 'another-run',
    purpose: 'verification',
  });
  assert.equal(result.text, '{"ok":true}');
  assert.deepEqual(result.usage, {
    input: 40,
    cacheWrite: 12,
    cacheRead: 4,
    output: 8,
  });
  await assert.rejects(replay.complete(request), /Missing LLM replay/);
  for (const changed of [
    { prompt: 'Changed' },
    { instructions: 'Changed' },
    { maxOutputTokens: 101 },
    { model: { ...request.model, id: 'changed-model' } },
  ])
    await assert.rejects(
      new ReplayLlmAdapter(fixture).complete({ ...request, ...changed }),
      /Missing LLM replay/,
    );
});
void test('recording preserves repeated responses in order, isolates mutations and omits request secrets', async () => {
  let calls = 0;
  const recorder = new RecordingLlmAdapter({
    async complete() {
      calls++;
      if (calls === 3) throw new Error('private provider failure');
      return {
        text: String(calls),
        usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
      };
    },
  });
  const first = await recorder.complete(request);
  first.text = 'mutated';
  await recorder.complete(request);
  await assert.rejects(recorder.complete(request), /private provider failure/);
  const snapshot = recorder.snapshot(
    'Synthetic unit-test responses; no inference.',
  );
  assert.equal(snapshot.records.length, 2);
  const serialized = JSON.stringify(snapshot);
  for (const forbidden of [
    'private provider failure',
    'Ready?',
    'instructions',
    'runId',
    'purpose',
    'headers',
  ])
    assert.ok(!serialized.includes(forbidden));
  const replay = new ReplayLlmAdapter(snapshot);
  snapshot.records[0].response.text = 'mutated snapshot';
  assert.equal((await replay.complete(request)).text, '1');
  assert.equal((await replay.complete(request)).text, '2');
  await assert.rejects(replay.complete(request), /Missing LLM replay/);
});
void test('malformed recordings and mismatched model metadata fail closed', async () => {
  assert.throws(() => new ReplayLlmAdapter({ version: 2, records: [] }));
  const snapshot = JSON.parse(JSON.stringify(fixture)) as {
    records: { model: string; response: { usage: { input: number } } }[];
  };
  snapshot.records[0].model = 'wrong';
  await assert.rejects(
    new ReplayLlmAdapter(snapshot).complete(request),
    /Missing LLM replay/,
  );
  snapshot.records[0].response.usage.input = -1;
  assert.throws(() => new ReplayLlmAdapter(snapshot));
});

void test('concurrent recordings replay in request order despite reversed completion and failures', async () => {
  const pending: {
    resolve: (response: {
      text: string;
      usage: {
        input: number;
        output: number;
        cacheWrite: number;
        cacheRead: number;
      };
    }) => void;
    reject: (error: Error) => void;
  }[] = [];
  const recorder = new RecordingLlmAdapter({
    complete() {
      return new Promise((resolve, reject) =>
        pending.push({ resolve, reject }),
      );
    },
  });
  const first = recorder.complete(request);
  const failed = recorder.complete(request);
  const failure = assert.rejects(failed, /provider failed/);
  const last = recorder.complete(request);
  assert.throws(() => recorder.snapshot('Incomplete'), /requests are pending/);
  const usage = { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 };
  pending[2].resolve({ text: 'last', usage });
  await last;
  assert.throws(() => recorder.snapshot('Incomplete'), /requests are pending/);
  pending[1].reject(new Error('provider failed'));
  await failure;
  assert.throws(() => recorder.snapshot('Incomplete'), /requests are pending/);
  pending[0].resolve({ text: 'first', usage });
  await first;
  const replay = new ReplayLlmAdapter(
    recorder.snapshot('Synthetic concurrent responses; no inference.'),
  );
  assert.equal((await replay.complete(request)).text, 'first');
  assert.equal((await replay.complete(request)).text, 'last');
  await assert.rejects(replay.complete(request), /Missing LLM replay/);
});

void test('failed and malformed provider responses release the snapshot guard', async () => {
  for (const complete of [
    () => {
      throw new Error('synchronous provider failure');
    },
    async () => ({
      text: 'invalid usage',
      usage: { input: -1, output: 1, cacheWrite: 0, cacheRead: 0 },
    }),
  ]) {
    const recorder = new RecordingLlmAdapter({ complete });
    await assert.rejects(recorder.complete(request));
    assert.deepEqual(recorder.snapshot('Synthetic failures').records, []);
  }
});
