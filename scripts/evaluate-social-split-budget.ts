// Read-only cold-cache request probe; never constructs a network provider.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import type { SelectedSocialPost } from '@digest/contracts';
import { digestPreviewSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../apps/api/src/modules/curation/application/social-editor';
import {
  CandidateTriage,
  type TriageTopic,
} from '../apps/api/src/modules/curation/application/triage';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';
import {
  articleTriageInput,
  type ArticleTriageSettings,
} from '../apps/api/src/modules/digests/domain/article-triage-input';
import { socialTriageCandidate } from '../apps/api/src/modules/social/public/editorial-selection';

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
  async function probe(topic: TriageTopic, posts: SelectedSocialPost[]) {
    const attempts: { model: string; purpose: string; micros: number }[] = [];
    const ledger = {
      reserve: (
        request: Parameters<LlmLedger['reserve']>[0],
        micros: number,
      ) => {
        attempts.push({
          model: request.model.id,
          purpose: request.purpose,
          micros,
        });
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
    const triage = new CandidateTriage(llm, ledger, config.haiku, 'social');
    const editor = new SocialPostEditor(llm, config.sonnet, config.haiku);
    for (const platform of ['x', 'reddit', 'bluesky'] as const) {
      const group = posts.filter((p) => p.platform === platform);
      assert.ok(group.length <= 10);
      if (!group.length) continue;
      const scored = await triage.score(
        topic,
        group.map(socialTriageCandidate),
        'offline-social',
      );
      assert.equal(scored.scores.length, 0);
      assert.equal(scored.unscoredIds.length, group.length);
      // Synthetic scores isolate editor request size; no semantic acceptance claim.
      const outcome = await editor.editOutcome(
        topic,
        group.map((p) => ({
          id: platform === 'x' ? p.externalId : `${platform}:${p.externalId}`,
          platform,
          text: p.text,
          author: p.author,
          publishedAt: p.publishedAt,
          relevance: 8,
          interestingness: 8,
        })),
        5,
        'offline-social',
        platform === 'bluesky'
          ? posts.filter((p) => p.platform !== 'bluesky')
          : [],
      );
      assert.equal(outcome.status, 'failed');
    }
    const groups = new Set(posts.map((p) => p.platform)).size;
    assert.equal(attempts.length, groups * 3);
    assert.equal(
      attempts.filter((a) => a.purpose === 'social-triage-v1').length,
      groups,
    );
    assert.ok(
      attempts.every((a) =>
        [
          'social-triage-v1',
          'social-editor-v2',
          'bluesky-social-editor-v2',
        ].includes(a.purpose),
      ),
    );
    for (let i = 0; i < attempts.length; i += 3) {
      assert.deepEqual(
        attempts.slice(i, i + 3).map((a) => a.model),
        [config.haiku.id, config.sonnet.id, config.haiku.id],
      );
    }
    return {
      posts: posts.length,
      attempts,
      reservationMicros: attempts.reduce((sum, a) => sum + a.micros, 0),
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
      const savedTopic = edition.topics.find((t) => t.id === settings.id);
      assert.ok(savedTopic);
      const posts = savedTopic.posts ?? [];
      assert.ok(
        posts.every((p) => p.platform !== 'reddit'),
        'Saved proxy assumes separate X and Bluesky groups',
      );
      const baselineTopic = articleTriageInput(settings, []).topic;
      const baseline = await probe(baselineTopic, posts);
      const world = await probe(
        {
          ...baselineTopic,
          name: 'World news & politics',
          description:
            'Global news and international affairs, including US foreign policy.',
          guidance:
            'Exclude principally domestic US politics, policy, elections and events.',
        },
        posts,
      );
      const us = await probe(
        {
          id: 'offline-us',
          name: 'U.S. news & politics',
          description: 'News that mainly plays out inside the United States.',
          guidance: 'Exclude international affairs and US foreign policy.',
        },
        posts,
      );
      measurements.push({
        date: window.date,
        baseline,
        world,
        us,
        marginalMicros:
          world.reservationMicros +
          us.reservationMicros -
          baseline.reservationMicros,
      });
    }
    assert.ok(measurements.some((m) => m.baseline.posts > 0));
    assert.equal(providerCalls, 0);
    console.log(
      JSON.stringify({
        measurements,
        providerCalls,
        note: 'Saved selected posts only, repeated for each scope; synthetic editor scores and omitted engagement evidence. Sequential cold-cache reservations including refusal fallback, not charges, historical requests, full candidate pools, repair costs, semantic assignments or whole-edition admission.',
      }),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}
void main().catch(() => {
  console.error('Read-only social probe failed');
  process.exitCode = 1;
});
