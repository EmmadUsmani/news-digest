// Read-only cold-cache request probe; never constructs a network provider.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import type { SelectedSocialPost } from '@digest/contracts';
import {
  digestPreviewSchema,
  type RelevancePolicy,
  relevancePolicySchema,
} from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { logger } from '../apps/api/src/libs/observability/logging';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import {
  CandidateTriage,
  type TriageTopic,
} from '../apps/api/src/modules/curation/application/triage';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';
import type { ArticleTriageSettings } from '../apps/api/src/modules/digests/domain/article-triage-input';
import { readBlueskyObservations } from '../apps/api/src/modules/social/database/bluesky.repository';
import type { BlueskyPost } from '../apps/api/src/modules/social/domain/bluesky';
import { shortlistBlueskyPosts } from '../apps/api/src/modules/social/public/bluesky-shortlist';
import { editTopicPosts } from '../apps/api/src/modules/social/public/editorial-selection';
import {
  selectTopicPosts,
  selectTopicRedditPosts,
} from '../apps/api/src/modules/social/public/selection';

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
  async function probe(
    topic: TriageTopic,
    posts: SelectedSocialPost[],
    bluesky: BlueskyPost[],
    policy: RelevancePolicy,
    start: Date,
    end: Date,
  ) {
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
    let scoredCandidates = 0;
    const services = {
      socialTriage: {
        score: async (...args: Parameters<CandidateTriage['score']>) => {
          scoredCandidates += args[1].length;
          const result = await triage.score(...args);
          assert.equal(result.scores.length, 0);
          assert.equal(result.unscoredIds.length, args[1].length);
          return result;
        },
      },
      socialEditor: { edit: unexpected },
    };
    const selected = await editTopicPosts(
      services,
      topic,
      posts,
      [],
      5,
      'offline-social-pool',
    );
    assert.equal(selected.posts.length, 0);
    const sky = await shortlistBlueskyPosts(
      services.socialTriage,
      topic,
      bluesky,
      policy,
      start,
      end,
      10,
      'offline-social-pool',
    );
    assert.equal(sky.posts.length, 0);
    assert.ok(
      attempts.every(
        (a) => a.model === config.haiku.id && a.purpose === 'social-triage-v1',
      ),
    );
    assert.ok(scoredCandidates >= posts.length);
    return {
      x: posts.filter((p) => p.platform === 'x').length,
      reddit: posts.filter((p) => p.platform === 'reddit').length,
      blueskyRead: bluesky.length,
      blueskyEligible: scoredCandidates - posts.length,
      batches: attempts.length,
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
      const start = new Date(edition.windowStart);
      const end = new Date(edition.windowEnd);
      const policy = relevancePolicySchema.parse(settings.relevance_policy);
      const posts: SelectedSocialPost[] = await selectTopicPosts(
        client,
        settings.id,
        policy,
        start,
        end,
        200,
        'semantic-candidates',
      );
      posts.push(
        ...(await selectTopicRedditPosts(
          client,
          settings.id,
          policy,
          start,
          end,
          200,
        )),
      );
      const bluesky = await readBlueskyObservations(
        client,
        settings.id,
        start,
        end,
        end,
      );
      // Social publication guidance deliberately differs from article triage guidance.
      const baselineTopic = {
        id: settings.id,
        name: settings.name,
        description: settings.description,
        guidance: `${settings.include_guidance}\nExclude: ${settings.exclude_guidance}`,
      };
      const baseline = await probe(
        baselineTopic,
        posts,
        bluesky,
        policy,
        start,
        end,
      );
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
        bluesky,
        policy,
        start,
        end,
      );
      const us = await probe(
        {
          id: 'offline-us',
          name: 'U.S. news & politics',
          description: 'News that mainly plays out inside the United States.',
          guidance: 'Exclude international affairs and US foreign policy.',
        },
        posts,
        bluesky,
        policy,
        start,
        end,
      );
      for (const proposed of [world, us]) {
        for (const key of [
          'x',
          'reddit',
          'blueskyRead',
          'blueskyEligible',
          'batches',
        ] as const)
          assert.equal(proposed[key], baseline[key]);
      }
      assert.ok(baseline.blueskyEligible <= 50);
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
    assert.ok(
      measurements.some(
        (m) =>
          m.baseline.x + m.baseline.reddit + m.baseline.blueskyEligible > 0,
      ),
    );
    assert.equal(providerCalls, 0);
    console.log(
      JSON.stringify({
        measurements,
        providerCalls,
        note: 'Current stored production candidate pools reused across scopes; cold-cache initial triage reservations only. Refusal prevents editors. Not charges, historical reconstruction, new domestic volume, semantic routing or whole-edition admission.',
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
