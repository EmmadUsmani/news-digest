// Read-only saved-window cost gate. Never dispatches inference or changes admission.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { digestPreviewSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import {
  llmConfig,
  scheduledReserveConfig,
} from '../apps/api/src/modules/curation/adapters/config';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { readFullAiEditionCosts } from '../apps/api/src/modules/curation/database/edition-cost.reader';
import {
  budgetAllowance,
  costMicros,
} from '../apps/api/src/modules/curation/domain/budget';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import { scheduledReserveAllowance } from '../apps/api/src/modules/curation/domain/scheduled-reserve';
import { loadArticleCandidates } from '../apps/api/src/modules/digests/database/article-candidates';
import {
  articleTriageInput,
  type ArticleTriageSettings,
} from '../apps/api/src/modules/digests/domain/article-triage-input';
import { editorialShortlist } from '../apps/api/src/modules/digests/domain/editorial-shortlist';

function reservation(request: LlmRequest) {
  return costMicros(
    {
      input: Buffer.byteLength(request.instructions + request.prompt) + 2048,
      output: request.maxOutputTokens,
      cacheRead: 0,
      cacheWrite: 0,
    },
    {
      ...request.model,
      input: Math.max(
        request.model.input,
        request.model.cacheRead,
        request.model.cacheWrite,
      ),
    },
  );
}
async function main() {
  assert.deepEqual(process.argv.slice(2), ['--read-only']);
  const env = parseEnv(
    readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  const config = llmConfig(env);
  const reserveConfig = scheduledReserveConfig(env);
  const db = database();
  const client = await db.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '15s'");
    const now = new Date();
    const {
      rows: [totals],
    } = await client.query<{ month: number; today: number }>(`SELECT
      coalesce(sum(coalesce(cost_micros,reserved_micros)) FILTER (WHERE created_at >= date_trunc('month',now() AT TIME ZONE 'UTC') OR status IN ('pending','uncertain')),0)::float8 AS month,
      coalesce(sum(coalesce(cost_micros,reserved_micros)) FILTER (WHERE created_at >= date_trunc('day',now() AT TIME ZONE 'UTC') OR status IN ('pending','uncertain')),0)::float8 AS today
      FROM llm_calls WHERE status <> 'failed'`);
    const recent = await readFullAiEditionCosts(client, now);
    const tomorrow = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
    );
    const allowance = budgetAllowance(
      tomorrow,
      { month: totals.month, today: 0 },
      config.caps,
    );
    const reserve = scheduledReserveAllowance(
      {
        ...allowance,
        todayUsed: 0,
        recentFullAiEditionCosts: recent,
        state: 'pending',
        scheduledRun: true,
      },
      reserveConfig.policy,
    );
    assert.ok(reserveConfig.enabled, 'Expected scheduled reserve enabled');
    const { rows } = await client.query<{ snapshot: unknown }>(
      "SELECT snapshot FROM digest_previews WHERE id='7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7'",
    );
    const edition = digestPreviewSchema.parse(rows[0]?.snapshot);
    assert.equal(edition.topics.length, 4);
    let newReservations = 0;
    let oldReservations = 0;
    let sonnetReservations = 0;
    const topicResults = [];
    for (const topic of edition.topics) {
      assert.ok(topic.editorial && topic.relevancePolicy);
      const {
        rows: [settings],
      } = await client.query<ArticleTriageSettings>(
        'SELECT id,name,description,include_guidance,exclude_guidance,relevance_policy FROM topics WHERE id=$1',
        [topic.id],
      );
      assert.ok(settings);
      const context = articleTriageInput(settings, []).topic;
      const candidates = await loadArticleCandidates(
        client,
        topic.id,
        new Date(edition.windowStart),
        new Date(edition.windowEnd),
      );
      const pool = editorialShortlist(
        candidates,
        topic.editorial.triage,
        topic.relevancePolicy,
        new Date(edition.windowStart),
        new Date(edition.windowEnd),
        undefined,
        40,
      ).shortlist;
      assert.ok(pool.length > 10, 'Insufficient saved scored pool');
      for (const size of [10, 40]) {
        const selectedPool = pool.slice(0, size);
        let groupingMicros = 0;
        await new EventGrouping(
          {
            json<T>(request: LlmRequest): Promise<T | null> {
              groupingMicros = reservation(request);
              return Promise.resolve(null);
            },
          },
          config.haiku,
        ).group(
          topic.id,
          selectedPool.map((c) => ({
            ...c,
            topicId: topic.id,
            outlet: c.sources.join(', '),
          })),
          'offline-budget',
        );
        // A grouped lead inherits merged source labels. Bound those with the
        // three largest encoded labels anywhere in this pool, then take the
        // ten largest possible lead inputs. These are cost-only synthetic inputs.
        const sourceBound = [
          ...new Set(
            selectedPool.flatMap((c) => c.sources.map((s) => s.slice(0, 80))),
          ),
        ]
          .sort(
            (a, b) =>
              Buffer.byteLength(JSON.stringify(b)) -
              Buffer.byteLength(JSON.stringify(a)),
          )
          .slice(0, 3);
        const boundedPool = selectedPool.map((c) => ({
          ...c,
          sources: sourceBound,
        }));
        const bytes = (c: (typeof pool)[number]) =>
          Buffer.byteLength(
            JSON.stringify({
              id: c.id,
              title: c.title.slice(0, 300),
              excerpt: c.excerpt?.slice(0, 600) ?? null,
              sources: c.sources.slice(0, 3).map((s) => s.slice(0, 80)),
            }),
          );
        const largest = [...boundedPool]
          .sort((a, b) => bytes(b) - bytes(a))
          .slice(0, 10);
        let editorMicros = 0;
        // Current configured topic context; not historical prompt reconstruction.
        await new ShortlistEditor(
          {
            json<T>(request: LlmRequest): Promise<T | null> {
              if (request.model.id === config.sonnet.id)
                editorMicros = reservation(request);
              return Promise.resolve(null);
            },
          },
          config.sonnet,
          config.haiku,
        ).edit(context, largest, 10, 'offline-budget');
        if (size === 40) {
          newReservations += groupingMicros + editorMicros;
          sonnetReservations += editorMicros;
        } else oldReservations += groupingMicros + editorMicros;
        topicResults.push({
          topic: topic.name,
          poolArticles: selectedPool.length,
          groupingMicros,
          editorMicros,
        });
      }
    }
    const {
      rows: [baseline],
    } = await client.query<{
      total: number;
      replaced: number;
      sonnetRetained: number;
    }>(
      `SELECT coalesce(sum(cost_micros),0)::float8 AS total,
      coalesce(sum(cost_micros) FILTER (WHERE purpose LIKE 'shortlist-editor-%' OR purpose LIKE '%group%'),0)::float8 AS replaced,
      coalesce(sum(cost_micros) FILTER (WHERE model=$2 AND purpose NOT LIKE 'shortlist-editor-%' AND purpose NOT LIKE '%group%'),0)::float8 AS "sonnetRetained"
      FROM llm_calls WHERE run_id=$1 AND status='succeeded'`,
      [edition.id, config.sonnet.id],
    );
    const projectedMicros =
      baseline.total - baseline.replaced + newReservations;
    const lowerAllowance = budgetAllowance(
      tomorrow,
      {
        month:
          totals.month + budgetAllowance(now, totals, config.caps).available,
        today: 0,
      },
      config.caps,
    );
    const sonnetScenarioMicros = baseline.sonnetRetained + sonnetReservations;
    const sonnetCeilingMicros = Math.floor(
      lowerAllowance.dailyCap * config.caps.modelAllocation!.dailyFraction,
    );
    console.log(
      JSON.stringify({
        capturedAt: now.toISOString(),
        models: { haiku: config.haiku, sonnet: config.sonnet },
        topics: topicResults,
        baseline,
        tenArticleScenarioMicros:
          baseline.total - baseline.replaced + oldReservations,
        reservationIncreaseMicros: newReservations - oldReservations,
        firstAttemptReservationScenarioMicros: projectedMicros,
        nextDayCapMicros: allowance.dailyCap,
        protectedReserveMicros: reserve.reserveMicros,
        capHeadroomMicros: allowance.dailyCap - projectedMicros,
        reserveHeadroomMicros: reserve.reserveMicros - projectedMicros,
        lowerNextDayCapMicros: lowerAllowance.dailyCap,
        sonnetScenarioMicros,
        sonnetCeilingMicros,
        withinCapAndReserve:
          projectedMicros <=
            Math.min(lowerAllowance.dailyCap, reserve.reserveMicros) &&
          sonnetScenarioMicros <= sonnetCeilingMicros,
        note: 'Current article text/topic settings plus saved scores; other stages retain measured Nov 5 cost. First attempts only; repairs/fallback and future volume remain independently admitted. No model grouping or future admission claimed.',
      }),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await db.end();
  }
}
void main().catch(() => {
  console.error('Read-only story-pool budget evaluation failed');
  process.exitCode = 1;
});
