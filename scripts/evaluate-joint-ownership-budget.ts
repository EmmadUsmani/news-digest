// Offline request admission probe. The ledger always refuses; no provider or DB.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';
import {
  EventGrouping,
  type GroupingCandidate,
  type StoryScope,
} from '../apps/api/src/modules/curation/application/event-grouping';
import { costMicros } from '../apps/api/src/modules/curation/domain/budget';

const config = llmConfig(
  parseEnv(readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')),
);
const scopes: StoryScope[] = [
  {
    id: 'world',
    name: 'World news & politics',
    description:
      'Global news and international affairs, including US foreign policy.',
    guidance: 'Wars, diplomacy, tariffs and trade with other countries.',
  },
  {
    id: 'us',
    name: 'U.S. news & politics',
    description: 'News that mainly plays out inside the United States.',
    guidance:
      'Congress, domestic policy, courts, elections and major domestic events.',
  },
];
let providerCalls = 0;
async function probe(
  name: string,
  candidates: GroupingCandidate[],
  inputScopes = scopes,
  editorScope?: StoryScope,
) {
  const reservations: {
    model: string;
    estimateMicros: number;
    inputByteBound: number;
    outputTokenLimit: number;
    outputReserveMicros: number;
  }[] = [];
  const unexpected = (): Promise<never> =>
    Promise.reject(
      new Error('Refused offline request attempted a ledger mutation'),
    );
  const llm = new BudgetedLlm(
    {
      complete: () => {
        providerCalls++;
        return Promise.reject(new Error('Offline provider prohibited'));
      },
    },
    {
      reserve: (request, estimate) => {
        reservations.push({
          model: request.model.id,
          estimateMicros: estimate,
          outputTokenLimit: request.maxOutputTokens,
          outputReserveMicros: costMicros(
            {
              input: 0,
              cacheWrite: 0,
              cacheRead: 0,
              output: request.maxOutputTokens,
            },
            request.model,
          ),
          inputByteBound:
            Buffer.byteLength(request.instructions + request.prompt, 'utf8') +
            2048,
        });
        return Promise.resolve(null);
      },
      cached: () => Promise.resolve(undefined),
      cache: unexpected,
      settle: unexpected,
      fail: unexpected,
    },
    logger.child({}, { level: 'silent' }),
  );
  const result = editorScope
    ? await new ShortlistEditor(llm, config.sonnet, config.haiku).edit(
        editorScope,
        candidates.map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          excerpt: candidate.excerpt ?? null,
          sources: [candidate.outlet],
        })),
        5,
        name,
      )
    : await new EventGrouping(llm, config.haiku).assignTopics(
        inputScopes,
        candidates,
        name,
      );
  assert.equal(result, null);
  assert.ok(reservations.length <= (editorScope ? 2 : 1));
  assert.equal(providerCalls, 0);
  console.log(
    JSON.stringify({ name, candidates: candidates.length, reservations }),
  );
  return reservations;
}
async function main() {
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
  for (const window of fixture.windows) {
    const result = await probe(
      window.date,
      window.stories.map((story) => ({
        id: story.id,
        topicId: 'world',
        title: story.title,
        excerpt: story.summary,
        outlet: 'Saved edition summary (offline proxy)',
        publishedAt: window.date,
      })),
    );
    assert.equal(result.length, 1);
    const baseline = await probe(
      `${window.date} unsplit story editor`,
      window.stories.map((story) => ({
        id: story.id,
        topicId: 'world',
        title: story.title,
        excerpt: story.summary,
        outlet: 'Saved edition summary (offline proxy)',
        publishedAt: window.date,
      })),
      scopes,
      scopes[0],
    );
    let splitSonnetMicros = 0;
    let splitHaikuMicros = 0;
    let splitOutputReserveMicros = 0;
    let nonemptyScopes = 0;
    // Exclusive manual fixture labels are an offline size probe, not AI ownership.
    for (const scope of scopes) {
      const stories = window.stories.filter(
        (story) => story.scope === scope.id,
      );
      if (!stories.length) continue;
      const attempts = await probe(
        `${window.date} ${scope.id} story editor`,
        stories.map((story) => ({
          id: story.id,
          topicId: scope.id,
          title: story.title,
          excerpt: story.summary,
          outlet: 'Saved edition summary (offline proxy)',
          publishedAt: window.date,
        })),
        scopes,
        scope,
      );
      nonemptyScopes++;
      splitSonnetMicros += attempts[0]?.estimateMicros ?? 0;
      splitHaikuMicros += attempts[1]?.estimateMicros ?? 0;
      splitOutputReserveMicros += attempts[0]?.outputReserveMicros ?? 0;
      assert.equal(
        attempts.length,
        2,
        'Sonnet refusal must try budgeted Haiku',
      );
      assert.equal(attempts[0].model, config.sonnet.id);
      assert.equal(attempts[1].model, config.haiku.id);
    }
    assert.equal(
      nonemptyScopes,
      new Set(window.stories.map((s) => s.scope)).size,
    );
    assert.equal(
      splitOutputReserveMicros,
      nonemptyScopes * baseline[0].outputReserveMicros,
    );
    assert.ok(splitSonnetMicros >= splitOutputReserveMicros);
    console.log(
      JSON.stringify({
        date: window.date,
        nonemptyScopes,
        splitOutputReserveMicros,
        splitInputReserveMicros: splitSonnetMicros - splitOutputReserveMicros,
        splitHaikuMicros,
        // Attempts are sequential alternatives; never simultaneous holds or charges.
        initialAndRefusedFallbackEnvelopeMicros:
          splitSonnetMicros + splitHaikuMicros,
        unsplitSonnetMicros: baseline[0].estimateMicros,
        splitSonnetMicros,
        marginalSonnetMicros: splitSonnetMicros - baseline[0].estimateMicros,
      }),
    );
  }
  const maximum = (character: string): GroupingCandidate[] =>
    Array.from({ length: 40 }, (_, i) => ({
      id: String(i).padStart(200, 'a'),
      topicId: i % 2 ? 'world' : 'us',
      title: character.repeat(500),
      outlet: character.repeat(120),
      publishedAt: character.repeat(40),
      excerpt: character.repeat(600),
    }));
  assert.equal(
    (await probe('40 maximum-length ASCII articles', maximum('a'))).length,
    1,
  );
  assert.equal(
    (await probe('40 maximum-length multibyte articles', maximum('界'))).length,
    0,
  );
  assert.equal(providerCalls, 0);
  console.log(
    'Offline reservation probes passed; saved summaries are not raw candidate volume. No edition admission or cap change established.',
  );
}
main().catch(() => {
  console.error('Offline joint ownership budget evaluation failed');
  process.exitCode = 1;
});
