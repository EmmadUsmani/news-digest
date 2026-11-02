// Explicit budgeted live shortlist-editor check; publishes no edition.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { database } from '../src/libs/db/connections';
import { AnthropicLlmAdapter } from '../src/modules/curation/adapters/anthropic';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import {
  type TriageCandidate,
  type TriageTopic,
} from '../src/modules/curation/application/triage';
import { configuredLlmLedger } from '../src/modules/curation/public/ledger';
import { readLlmUsage } from '../src/modules/curation/public/usage';

async function smoke() {
  assert.equal(
    process.env.LLM_LIVE,
    '1',
    'Live verification requires LLM_LIVE=1',
  );
  const key = process.env.ANTHROPIC_API_KEY;
  assert.ok(key, 'Load configured secrets environment');
  const db = database();
  const runId = 'live-editor-' + randomUUID();
  try {
    const config = llmConfig();
    const ledger = configuredLlmLedger(db, config.caps, true);
    const editor = new ShortlistEditor(
      new BudgetedLlm(new AnthropicLlmAdapter(key), ledger),
      config.sonnet,
      config.haiku,
    );
    const topics = (
      await db.query<TriageTopic>(
        `SELECT id,name,description,include_guidance || E'\nExclude: ' || exclude_guidance AS guidance FROM topics WHERE enabled AND profile_id='00000000-0000-4000-8000-000000000001' ORDER BY position,id`,
      )
    ).rows;
    assert.equal(topics.length, 4);
    // One topic (NBA) only: bound this explicit paid verification.
    const results = [];
    for (const topic of topics.slice(1, 2)) {
      const candidates = (
        await db.query<TriageCandidate>(
          `SELECT i.id,i.title,i.excerpt,array_agg(DISTINCT s.name ORDER BY s.name) AS sources FROM content_items i JOIN content_observations o ON o.item_id=i.id JOIN content_sources s ON s.id=o.source_id JOIN topic_source_connections c ON c.source_id=s.id WHERE c.topic_id=$1 AND i.published_at >= now()-interval '24 hours' AND i.published_at < now() GROUP BY i.id ORDER BY i.published_at DESC,i.id LIMIT 3`,
          [topic.id],
        )
      ).rows;
      assert.equal(candidates.length, 3);
      const result = await editor.edit(topic, candidates, 2, runId);
      assert.ok(result, 'Budget/provider refusal: inspect sanitized status');
      assert.ok(result.stories.length <= 2);
      const before = (
        await db.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM llm_calls',
        )
      ).rows[0].n;
      const repeat = await editor.edit(topic, candidates, 2, runId + '-cache');
      assert.deepEqual(repeat, result);
      const after = (
        await db.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM llm_calls',
        )
      ).rows[0].n;
      assert.equal(
        after,
        before,
        'Identical regeneration must reuse editorial cache',
      );
      results.push({
        topic: topic.name,
        realCandidates: candidates.length,
        selectedStories: result.stories.length,
        model: result.model,
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
  if (process.env.LLM_LIVE !== '1') {
    console.error('Live verification requires LLM_LIVE=1; no calls made.');
    process.exitCode = 1;
    return;
  }
  console.error(
    'Live editor check failed; inspect sanitized usage ledger. No edition was published.',
  );
  process.exitCode = 1;
});
