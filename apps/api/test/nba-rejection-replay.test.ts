import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { replayNbaRejections } from '../scripts/replay-nba-rejections';
import { ReplayLlmAdapter } from '../src/modules/curation/adapters/recorded-llm';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import {
  type EditorialResult,
  ShortlistEditor,
} from '../src/modules/curation/application/editor';
import { llmFingerprint } from '../src/modules/curation/application/llm-fingerprint';
import type {
  TriageCandidate,
  TriageTopic,
} from '../src/modules/curation/application/triage';
import type {
  LlmRequest,
  ModelPrice,
} from '../src/modules/curation/domain/llm.port';

void test('recorded NBA invalid story ID receives fixed repair guidance and can recover without changing prose', async () => {
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/llm/nba-2026-11-12-rejected.json'),
      'utf8',
    ),
  ) as {
    entries: Array<{
      input: {
        topic: TriageTopic;
        candidates: TriageCandidate[];
        budget: number;
      };
      output: Omit<EditorialResult, 'model'>;
      model: ModelPrice;
    }>;
  };
  const { input, output, model } = fixture.entries[2];
  const ids = new Set(input.candidates.map((candidate) => candidate.id));
  const invalid = output.stories.filter((story) => !ids.has(story.id));
  assert.equal(invalid.length, 1);
  assert.equal(invalid[0].evidenceIds.length, 1);
  assert.ok(ids.has(invalid[0].evidenceIds[0]));
  // Simulate only the ID correction in a provider repair, preserving every
  // recorded factual field. Production never guesses or remaps invalid IDs.
  const repaired = {
    ...output,
    stories: output.stories.map((story) =>
      ids.has(story.id) ? story : { ...story, id: story.evidenceIds[0] },
    ),
  };
  const calls: LlmRequest[] = [];
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls.push(request);
        return {
          text: JSON.stringify(calls.length === 1 ? output : repaired),
          usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    {
      async cached() {
        return undefined;
      },
      async cache() {},
      async reserve() {
        return 'offline';
      },
      async settle() {},
      async fail() {},
    },
  );
  const editor = new ShortlistEditor(llm, model, model);
  const result = await editor.edit(
    input.topic,
    input.candidates,
    input.budget,
    'offline',
  );
  assert.deepEqual(result, { ...repaired, model: model.id });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].model.id, calls[1].model.id);
  assert.ok(calls[1].prompt.startsWith(calls[0].prompt));
  const guidance = calls[1].prompt.slice(calls[0].prompt.length);
  assert.ok(guidance.includes('failed the story-selection check'));
  assert.ok(guidance.includes('Copy every story id exactly'));
  assert.ok(!guidance.includes(invalid[0].id));
  assert.ok(!guidance.includes(invalid[0].headline));
  assert.deepEqual(
    llm
      .validationDiagnostics()
      .map(({ category, attempt }) => ({ category, attempt })),
    [{ category: 'invalid-selection', attempt: 'initial' }],
  );
});

void test('saved Sonnet selection excluding unresolved Curry validates with unchanged Reaves prose', async () => {
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/llm/nba-2026-11-12-rejected.json'),
      'utf8',
    ),
  ) as {
    entries: Array<{
      input: {
        topic: TriageTopic;
        candidates: TriageCandidate[];
        budget: number;
      };
      output: Omit<EditorialResult, 'model'>;
      model: ModelPrice;
    }>;
  };
  const { input, output, model } = fixture.entries[0];
  // This isolation probe removes one story and its brief bullet. It changes
  // none of the retained model prose and is not a complete-edition replay.
  const isolated = {
    stories: output.stories.filter((s) => !s.summary.includes('Stephen Curry')),
    brief: output.brief.slice(1),
  };
  assert.equal(isolated.stories.length, 4);
  assert.ok(
    isolated.stories.some((s) => s.summary.includes('No update on AR')),
  );
  let calls = 0;
  const editor = new ShortlistEditor(
    {
      async json(_request, validate) {
        calls++;
        return await Promise.resolve(validate(isolated));
      },
    },
    model,
    model,
  );
  const result = await editor.edit(
    input.topic,
    input.candidates,
    input.budget,
    'offline',
  );
  assert.deepEqual(result, { ...isolated, model: model.id });
  assert.equal(calls, 1);
});

void test('Nov 12 recorded NBA outputs replay through production validation without provider access', async () => {
  const replay = await replayNbaRejections();
  assert.equal(replay.editionId, 'b1be5a12-2972-4eeb-9bff-82cbb10c1b07');
  assert.deepEqual(
    replay.results.map((r) => [r.model, r.attempt, r.validated, r.failure]),
    [
      ['claude-sonnet-5-5', 'initial', true, null],
      ['claude-sonnet-5-5', 'repair', true, null],
      [
        'claude-haiku-5-5',
        'initial',
        false,
        { category: 'invalid-selection', field: undefined },
      ],
      ['claude-haiku-5-5', 'repair', true, null],
    ],
  );
  // Check every factual field, including those behind a selection failure.
  assert.deepEqual(
    replay.results.map((r) => r.absenceFailures.map((f) => f.field)),
    [[], [], [], []],
  );
});

void test('verbatim Nov 12 NBA response survives fingerprinted transport, JSON decoding and current story validation', async () => {
  const raw = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/llm/nba-2026-11-12-raw.json'),
      'utf8',
    ),
  ) as {
    provenance: string;
    request: LlmRequest;
    responseText: string;
  };
  const saved = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/llm/nba-2026-11-12-rejected.json'),
      'utf8',
    ),
  ) as {
    entries: Array<{
      input: {
        topic: TriageTopic;
        candidates: TriageCandidate[];
        budget: number;
      };
      output: Omit<EditorialResult, 'model'>;
      model: ModelPrice;
    }>;
  };
  const { input, output, model } = saved.entries[0];
  const fingerprint =
    '640b54bff32d01928e6f30eac446512e08c5c6da1a46e0d0ba8a8d1f05858501';
  assert.equal(llmFingerprint(raw.request), fingerprint);
  assert.deepEqual(JSON.parse(raw.responseText), output);
  // Only the text is historical. The diagnostic artifact did not retain token
  // counts; zero usage is synthetic, never production spend evidence.
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  const recording = {
    version: 1,
    provenance: raw.provenance,
    records: [
      {
        fingerprint,
        model: model.id,
        response: { text: raw.responseText, usage },
      },
    ],
  };
  for (const changed of [
    { prompt: raw.request.prompt + 'changed' },
    { instructions: raw.request.instructions + 'changed' },
  ]) {
    await assert.rejects(
      new ReplayLlmAdapter(recording).complete({ ...raw.request, ...changed }),
      /Missing LLM replay/,
    );
  }
  const cached = new Map<string, unknown>();
  let reservations = 0;
  let settlements = 0;
  const llm = new BudgetedLlm(new ReplayLlmAdapter(recording), {
    async cached(key) {
      return cached.get(key);
    },
    async cache(key, value) {
      cached.set(key, value);
    },
    async reserve() {
      reservations++;
      return 'offline-raw';
    },
    async settle(_id, actual, cost) {
      settlements++;
      assert.deepEqual(actual, usage);
      assert.equal(cost, 0);
    },
    async fail() {
      assert.fail('Historical body must validate');
    },
  });
  const editor = new ShortlistEditor(
    {
      // Use the historical request for transport identity, and today's full
      // production validator for the saved candidates. This does not assert that
      // today's prompt matches the archived prompt or replay a complete edition.
      json: (_request, validate) =>
        llm.json(raw.request, validate, { repair: false }),
    },
    model,
    model,
  );
  const expected = { ...output, model: model.id };
  assert.deepEqual(
    await editor.edit(input.topic, input.candidates, input.budget, 'offline'),
    expected,
  );
  assert.deepEqual(
    await editor.edit(
      input.topic,
      input.candidates,
      input.budget,
      'offline-cache',
    ),
    expected,
  );
  assert.equal(reservations, 1);
  assert.equal(settlements, 1);
  assert.equal(cached.size, 1);
  assert.deepEqual(llm.validationDiagnostics(), []);
});
