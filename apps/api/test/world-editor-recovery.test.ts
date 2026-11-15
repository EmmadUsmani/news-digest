import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

type Input = {
  topic: Parameters<ShortlistEditor['edit']>[0];
  candidates: Parameters<ShortlistEditor['edit']>[1];
  budget: number;
};
const fixture = JSON.parse(
  readFileSync(
    join(__dirname, 'fixtures/llm/world-2026-11-15-rejected.json'),
    'utf8',
  ),
) as {
  entries: Array<{ artifact: string; input: Input; responseText: string }>;
};
const config = llmConfig({});

// Only an in-memory port and ledger: no production adapters or credentials.
function replay(bodies: string[], repair: boolean) {
  let calls = 0;
  const cache = new Map<string, unknown>();
  const ledger: LlmLedger = {
    async cached(key) {
      return cache.get(key);
    },
    async cache(key, value) {
      cache.set(key, value);
    },
    async reserve(request) {
      return request.model.id === config.sonnet.id ? 'offline' : null;
    },
    async settle() {},
    async fail() {},
  };
  const llm = new BudgetedLlm(
    {
      async complete() {
        const text = bodies[calls++];
        assert.notEqual(text, undefined, 'Unexpected extra inference attempt');
        return {
          text,
          usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    ledger,
  );
  const editor = new ShortlistEditor(
    {
      json: (request, validate) => llm.json(request, validate, { repair }),
    },
    config.sonnet,
    config.haiku,
  );
  return { editor, llm, cache, calls: () => calls };
}
const [sonnetInitial, sonnetRepair, haikuInitial, haikuRepair] =
  fixture.entries;

void test('recorded World Sonnet initial rejection repairs to five stories and reuses validated cache', async () => {
  const h = replay(
    [sonnetInitial.responseText, sonnetRepair.responseText],
    true,
  );
  const { topic, candidates, budget } = sonnetInitial.input;
  const result = await h.editor.edit(
    topic,
    candidates,
    budget,
    'offline-world',
  );
  assert.ok(result);
  assert.equal(result.stories.length, 5);
  assert.deepEqual(
    result.stories,
    JSON.parse(sonnetRepair.responseText).stories,
  );
  assert.equal(h.calls(), 2);
  assert.deepEqual(
    h.llm.validationDiagnostics().map((d) => [d.category, d.field]),
    [['unsupported-absence', 'summary']],
  );
  assert.equal(h.cache.size, 1);
  assert.deepEqual(
    await h.editor.edit(topic, candidates, budget, 'offline-cache'),
    result,
  );
  assert.equal(h.calls(), 2);
});

for (const entry of [sonnetInitial, haikuInitial, haikuRepair]) {
  void test(`recorded World unresolved output remains refused: ${entry.artifact}`, async () => {
    const h = replay([entry.responseText], false);
    const { topic, candidates, budget } = entry.input;
    assert.equal(
      await h.editor.edit(topic, candidates, budget, 'offline-refusal'),
      null,
    );
    assert.equal(h.calls(), 1);
    assert.equal(h.cache.size, 0);
    // The fenced Haiku response must reach content validation, not fail JSON.
    assert.deepEqual(
      h.llm.validationDiagnostics().map((d) => [d.category, d.field]),
      [['unsupported-absence', 'summary']],
    );
  });
}
