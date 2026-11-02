// Explicit live verification: six real stored candidates/topic, at most one
// repair per batch. Uses only the configured direct Anthropic budgeted adapter.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { database } from '../src/libs/db/connections';
import { AnthropicLlmAdapter } from '../src/modules/curation/adapters/anthropic';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import {
  CandidateTriage,
  type TriageCandidate,
  type TriageTopic,
} from '../src/modules/curation/application/triage';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { readLlmUsage } from '../src/modules/curation/public/usage';

async function smoke() {
  const key = process.env.ANTHROPIC_API_KEY;
  assert.ok(key, 'Load configured secrets environment');
  const db = database();
  const runId = 'live-triage-' + randomUUID();
  try {
    const config = llmConfig();
    const ledger = new PostgresLlmLedger(db, config.caps);
    const triage = new CandidateTriage(
      new BudgetedLlm(new AnthropicLlmAdapter(key), ledger),
      ledger,
      config.haiku,
    );
    const topics = (
      await db.query<TriageTopic>(
        `SELECT id,name,description,include_guidance || E'\nExclude: ' || exclude_guidance AS guidance FROM topics WHERE enabled AND profile_id='00000000-0000-4000-8000-000000000001' ORDER BY position,id`,
      )
    ).rows;
    assert.equal(topics.length, 4);
    const results = [];
    for (const topic of topics) {
      const candidates = (
        await db.query<TriageCandidate>(
          `SELECT i.id,i.title,i.excerpt,array_agg(DISTINCT s.name ORDER BY s.name) AS sources FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=$1 AND i.published_at >= now()-interval '24 hours' AND i.published_at < now() GROUP BY i.id ORDER BY i.published_at DESC,i.id LIMIT 6`,
          [topic.id],
        )
      ).rows;
      assert.equal(candidates.length, 6);
      const result = await triage.score(topic, candidates, runId);
      assert.deepEqual(
        result.unscoredIds,
        [],
        'Budget/provider refusal: inspect sanitized status',
      );
      assert.equal(result.scores.length, candidates.length);
      const before = (
        await db.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM llm_calls',
        )
      ).rows[0].n;
      const repeat = await triage.score(
        topic,
        candidates.slice().reverse(),
        runId + '-cache',
      );
      assert.deepEqual(repeat.scores, result.scores.slice().reverse());
      const after = (
        await db.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM llm_calls',
        )
      ).rows[0].n;
      assert.equal(
        after,
        before,
        'Reordered regeneration must reuse per-item cache',
      );
      results.push({
        topic: topic.name,
        realCandidates: candidates.length,
        validatedScores: result.scores.length,
        cacheAvoidedCalls: true,
      });
    }
    const calls = (
      await db.query<{ calls: number; costMicros: number }>(
        'SELECT count(*)::int AS calls,coalesce(sum(cost_micros),0)::int AS "costMicros" FROM llm_calls WHERE run_id=$1',
        [runId],
      )
    ).rows[0];
    console.log(
      JSON.stringify({
        runId,
        results,
        ...calls,
        usage: await readLlmUsage(db),
      }),
    );
  } finally {
    await db.end();
  }
}
void smoke().catch(() => {
  console.error(
    'Live triage check failed; inspect sanitized usage ledger. No edition was published.',
  );
  process.exitCode = 1;
});
