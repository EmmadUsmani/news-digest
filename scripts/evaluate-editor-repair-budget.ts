// Synthetic invalid responses exercise production admission without network or DB.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';

const config = llmConfig(
  parseEnv(readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')),
);
const fixture = JSON.parse(
  readFileSync(
    'apps/api/test/fixtures/world-us-scope-2026-11-04-10.json',
    'utf8',
  ),
) as {
  windows: {
    date: string;
    stories: { id: string; title: string; summary: string; scope: string }[];
  }[];
};

async function probe(
  stories: (typeof fixture.windows)[number]['stories'],
  scope: string,
  refuseRepair: boolean,
) {
  const reservations: { model: string; micros: number; admitted: boolean }[] =
    [];
  let completions = 0;
  let settlements = 0;
  const llm = new BudgetedLlm(
    {
      complete: () => {
        completions++;
        return Promise.resolve({
          text: '{}',
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        });
      },
    },
    {
      reserve: (request, micros) => {
        assert.equal(settlements, completions);
        const admitted = !refuseRepair || reservations.length % 2 === 0;
        reservations.push({ model: request.model.id, micros, admitted });
        return Promise.resolve(admitted ? String(reservations.length) : null);
      },
      cached: () => Promise.resolve(undefined),
      settle: () => {
        settlements++;
        return Promise.resolve();
      },
      cache: () =>
        Promise.reject(
          new Error('Invalid synthetic response must never be cached'),
        ),
      fail: () => Promise.reject(new Error('Synthetic provider cannot fail')),
    },
    logger.child({}, { level: 'silent' }),
  );
  const result = await new ShortlistEditor(
    llm,
    config.sonnet,
    config.haiku,
  ).edit(
    {
      id: scope,
      name:
        scope === 'world' ? 'World news & politics' : 'U.S. news & politics',
      description: '',
      guidance: '',
    },
    stories.map((s) => ({
      id: s.id,
      title: s.title,
      excerpt: s.summary,
      sources: ['Saved summary proxy'],
    })),
    5,
    'offline-repair-budget',
  );
  assert.equal(result, null);
  assert.equal(reservations.length, 4);
  assert.deepEqual(
    reservations.map((r) => r.model),
    [config.sonnet.id, config.sonnet.id, config.haiku.id, config.haiku.id],
  );
  assert.equal(completions, refuseRepair ? 2 : 4);
  assert.equal(settlements, completions);
  assert.equal(llm.validationDiagnostics().length, completions);
  for (const start of [0, 2])
    assert.ok(reservations[start + 1].micros > reservations[start].micros);
  return reservations;
}

async function main() {
  for (const window of fixture.windows) {
    const baseline = await probe(window.stories, 'world', false);
    let splitEnvelopeMicros = 0;
    for (const scope of ['world', 'us']) {
      const stories = window.stories.filter((s) => s.scope === scope);
      if (!stories.length) continue;
      const admitted = await probe(stories, scope, false);
      const refused = await probe(stories, scope, true);
      assert.deepEqual(
        refused.map((r) => r.micros),
        admitted.map((r) => r.micros),
      );
      assert.deepEqual(
        refused.map((r) => r.admitted),
        [true, false, true, false],
      );
      splitEnvelopeMicros += admitted.reduce((sum, r) => sum + r.micros, 0);
    }
    const baselineEnvelopeMicros = baseline.reduce(
      (sum, r) => sum + r.micros,
      0,
    );
    console.log(
      JSON.stringify({
        date: window.date,
        baselineEnvelopeMicros,
        splitEnvelopeMicros,
        marginalEnvelopeMicros: splitEnvelopeMicros - baselineEnvelopeMicros,
      }),
    );
  }
  console.log(
    'Synthetic repair probes passed; summed sequential reservations are not charges or simultaneous holds. No network, database or production ledger writes.',
  );
}
main().catch(() => {
  console.error('Offline editor repair budget probe failed');
  process.exitCode = 1;
});
