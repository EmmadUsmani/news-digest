// Read-only cold-cache request probe; never constructs a network provider.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { digestPreviewSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import {
  CandidateTriage,
  type TriageCandidate,
  type TriageTopic,
} from '../apps/api/src/modules/curation/application/triage';
import { loadArticleCandidates } from '../apps/api/src/modules/digests/database/article-candidates';
import {
  articleTriageInput,
  type ArticleTriageSettings,
} from '../apps/api/src/modules/digests/domain/article-triage-input';

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--read-only']);
  const config = llmConfig(
    parseEnv(readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')),
  );
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-us-scope-2026-11-04-10.json',
      'utf8',
    ),
  ) as { windows: { date: string; editionId: string }[] };
  let providerCalls = 0;
  const unexpected = (): Promise<never> =>
    Promise.reject(new Error('Offline mutation prohibited'));
  async function probe(topic: TriageTopic, candidates: TriageCandidate[]) {
    const attempts: { estimateMicros: number; candidates: number }[] = [];
    const attemptedIds: string[] = [];
    const ledger = {
      reserve: (
        request: Parameters<
          import('../apps/api/src/modules/curation/domain/llm-ledger.port').LlmLedger['reserve']
        >[0],
        estimate: number,
      ) => {
        assert.equal(request.model.id, config.haiku.id);
        assert.equal(request.purpose, 'candidate-triage-v1');
        const items = JSON.parse(request.prompt).candidates as {
          originalId: string;
        }[];
        const count = items.length;
        attemptedIds.push(...items.map((item) => item.originalId));
        assert.ok(count > 0 && count <= 50);
        attempts.push({ estimateMicros: estimate, candidates: count });
        return Promise.resolve(null);
      },
      cached: () => Promise.resolve(undefined),
      cache: unexpected,
      settle: unexpected,
      fail: unexpected,
    };
    const llm = new BudgetedLlm(
      {
        complete: () => {
          providerCalls++;
          return unexpected();
        },
      },
      ledger,
      logger.child({}, { level: 'silent' }),
    );
    const result = await new CandidateTriage(llm, ledger, config.haiku).score(
      topic,
      candidates,
      'offline-raw-triage',
    );
    assert.deepEqual(
      attemptedIds,
      candidates.map((item) => item.id),
    );
    assert.equal(result.scores.length, 0);
    assert.equal(result.unscoredIds.length, candidates.length);
    assert.equal(
      attempts.reduce((sum, item) => sum + item.candidates, 0),
      candidates.length,
    );
    return {
      batches: attempts.length,
      reservationMicros: attempts.reduce(
        (sum, item) => sum + item.estimateMicros,
        0,
      ),
    };
  }
  const db = database();
  const client = await db.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '15s'");
    const {
      rows: [settings],
    } = await client.query<ArticleTriageSettings>(
      'SELECT id,name,description,include_guidance,exclude_guidance,relevance_policy FROM topics WHERE id=$1',
      ['00000000-0000-4000-8000-000000000014'],
    );
    assert.ok(settings);
    const measurements = [];
    for (const window of fixture.windows) {
      const {
        rows: [row],
      } = await client.query<{ snapshot: unknown }>(
        'SELECT snapshot FROM digest_previews WHERE id=$1',
        [window.editionId],
      );
      const edition = digestPreviewSchema.parse(row?.snapshot);
      const raw = await loadArticleCandidates(
        client,
        settings.id,
        new Date(edition.windowStart),
        new Date(edition.windowEnd),
      );
      const input = articleTriageInput(settings, raw);
      assert.ok(input.candidates.length > 0);
      const baseline = await probe(input.topic, input.candidates);
      const world = await probe(
        {
          id: settings.id,
          name: 'World news & politics',
          description:
            'Global news and international affairs, including US foreign policy.',
          guidance:
            'Wars, diplomacy, tariffs and trade with other countries. Exclude principally domestic US politics, policy, elections and events.',
        },
        input.candidates,
      );
      const us = await probe(
        {
          id: 'offline-us',
          name: 'U.S. news & politics',
          description: 'News that mainly plays out inside the United States.',
          guidance:
            'Congress, domestic policy, courts, elections, federal and state policy, and major domestic events. Exclude international affairs and US foreign policy.',
        },
        input.candidates,
      );
      measurements.push({
        date: window.date,
        raw: raw.length,
        eligible: input.candidates.length,
        baseline,
        world,
        us,
        marginalMicros:
          world.reservationMicros +
          us.reservationMicros -
          baseline.reservationMicros,
      });
    }
    assert.equal(providerCalls, 0);
    console.log(
      JSON.stringify({
        measurements,
        providerCalls,
        note: 'Cold-cache sequential initial reservations on current saved World raw pool and current eligibility settings; both proposed scopes see the same pool. Not charges, historical reconstruction, semantic assignments, new domestic volume, repairs, social work or whole-edition admission.',
      }),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}
void main().catch(() => {
  console.error('Read-only raw-triage probe failed');
  process.exitCode = 1;
});
