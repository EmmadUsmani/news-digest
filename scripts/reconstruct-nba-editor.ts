// Read-only reconstruction. No provider, ledger, cache or publication writes.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

import { digestPreviewSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { llmFingerprint } from '../apps/api/src/modules/curation/application/llm-fingerprint';
import { CandidateTriage } from '../apps/api/src/modules/curation/application/triage';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import { groupShortlist } from '../apps/api/src/modules/digests/application/group-shortlist';
import { loadArticleCandidates } from '../apps/api/src/modules/digests/database/article-candidates';
import { articleTriageInput } from '../apps/api/src/modules/digests/domain/article-triage-input';
import { editorialShortlist } from '../apps/api/src/modules/digests/domain/editorial-shortlist';
import { rank } from '../apps/api/src/modules/digests/domain/rank';

async function main() {
  const [flag, output, ...extra] = process.argv.slice(2);
  assert.ok(flag === '--read-only-cache' && output && !extra.length);
  const pool = database();
  const client = await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await client.query("SET LOCAL statement_timeout = '10s'");
    const { rows } = await client.query(
      "SELECT id, created_at, snapshot FROM digest_previews WHERE kind='scheduled' AND window_end='2026-11-10T15:00:00Z' AND published_at IS NOT NULL",
    );
    assert.equal(rows.length, 1);
    const edition = digestPreviewSchema.parse(rows[0].snapshot);
    const saved = edition.topics.find((t) => t.name === 'NBA');
    assert.ok(saved?.editorial);
    assert.equal(saved.editorial.unscoredIds.length, 0);
    const settings = await client.query(
      'SELECT id,name,description,include_guidance,exclude_guidance,relevance_policy,story_budget FROM topics WHERE id=$1',
      [saved.id],
    );
    assert.equal(settings.rows.length, 1);
    const topic = settings.rows[0];
    const start = new Date(edition.windowStart);
    const end = new Date(edition.windowEnd);
    const candidates = await loadArticleCandidates(
      client,
      saved.id,
      start,
      end,
    );
    const ids = new Set(saved.editorial.triage.map((s) => s.id));
    for (const candidate of candidates) {
      const historical = saved.stories
        .flatMap((story) => [story, ...(story.coverage ?? [])])
        .find((item) => item.id === candidate.id);
      if (historical) {
        candidate.title = historical.title;
        candidate.sources = historical.sources;
        candidate.publishedAt = historical.publishedAt;
      }
    }
    const input = articleTriageInput(
      topic,
      candidates.filter((c) => ids.has(c.id)),
    );
    assert.equal(
      input.candidates.length,
      ids.size,
      'Saved triage inputs missing',
    );
    const cache = async (key: string) => {
      const result = await client.query(
        'SELECT response,created_at FROM llm_cache WHERE cache_key=$1',
        [key],
      );
      if (!result.rows.length) return null;
      assert.ok(
        new Date(result.rows[0].created_at) <= new Date(rows[0].created_at),
        'Cache entry postdates edition',
      );
      return result.rows[0].response;
    };
    const config = llmConfig();
    const triage = new CandidateTriage(
      {
        json() {
          return Promise.reject(new Error('Provider forbidden'));
        },
      },
      {
        cached: cache,
        cache() {
          return Promise.reject(new Error('Writes forbidden'));
        },
      },
      config.haiku,
    );
    // Observations can add outlets after publication. Recover only a subset
    // whose complete historical input fingerprint already exists in cache.
    let scores = await triage.cachedScores(input.topic, input.candidates);
    let recoveredSources = 0;
    const unresolved: string[] = [];
    for (const candidate of input.candidates) {
      if (scores.some((s) => s.id === candidate.id)) continue;
      assert.ok(
        candidate.sources.length <= 8,
        'Source subset search exceeds bound',
      );
      const hits = [];
      for (let mask = 1; mask < 2 ** candidate.sources.length; mask++) {
        const variant = {
          ...candidate,
          sources: candidate.sources.filter((_, index) => mask & (1 << index)),
        };
        const cached = await triage.cachedScores(input.topic, [variant]);
        if (cached.length) hits.push({ variant, score: cached[0] });
      }
      if (hits.length !== 1) {
        unresolved.push(candidate.id);
        continue;
      }
      candidate.sources = hits[0].variant.sources;
      recoveredSources++;
    }
    scores = await triage.cachedScores(input.topic, input.candidates);
    assert.deepEqual(
      [...scores].sort((a, b) => a.id.localeCompare(b.id)),
      saved.editorial.triage
        .filter((s) => !unresolved.includes(s.id))
        .sort((a, b) => a.id.localeCompare(b.id)),
      'Historical cache scores differ from the saved edition',
    );
    // Saved scores are immutable edition evidence even if source text changed.
    // A changed candidate cannot affect grouping/editor inputs when it is
    // outside the score-ordered, forty-item pool. Never substitute its text.
    const historicalPool = editorialShortlist(
      input.candidates,
      saved.editorial.triage,
      topic.relevance_policy,
      start,
      end,
      undefined,
      40,
    ).shortlist;
    const unresolvedInPool = unresolved.filter((id) =>
      historicalPool.some((candidate) => candidate.id === id),
    );
    if (unresolvedInPool.length) {
      await writeFile(
        output,
        JSON.stringify(
          {
            status: 'historical-input-gap',
            editionId: rows[0].id,
            topic: input.topic,
            candidates: input.candidates,
            savedScores: saved.editorial.triage,
            matchedScores: scores,
            unresolved,
            unresolvedInPool,
            groupingPool: historicalPool.map((candidate) => candidate.id),
            note: 'Current inputs do not reproduce every historical triage fingerprint. No editor request was constructed; this artifact cannot establish an exact historical replay.',
          },
          null,
          2,
        ) + '\n',
        { mode: 0o600, flag: 'wx' },
      );
      console.log(
        JSON.stringify({
          status: 'historical-input-gap',
          savedScores: ids.size,
          matchedScores: scores.length,
          unresolved,
          unresolvedInPool,
          providerCalls: 0,
          output,
        }),
      );
      await client.query('ROLLBACK');
      return;
    }
    if (unresolved.length) {
      assert.equal(historicalPool.length, 40);
      const cutoff = saved.editorial.triage.find(
        (score) => score.id === historicalPool[39].id,
      );
      assert.ok(cutoff);
      for (const id of unresolved) {
        const gap = saved.editorial.triage.find((score) => score.id === id);
        assert.ok(gap);
        assert.ok(
          cutoff.importance > gap.importance ||
            (cutoff.importance === gap.importance &&
              (cutoff.relevance > gap.relevance ||
                (cutoff.relevance === gap.relevance &&
                  cutoff.id.localeCompare(gap.id) < 0))),
          'Unverified input could change historical pool membership',
        );
      }
    }
    scores = saved.editorial.triage;
    const { shortlist } = editorialShortlist(
      input.candidates,
      scores,
      topic.relevance_policy,
      start,
      end,
      undefined,
      40,
    );
    let groupingHits = 0;
    const grouping = new EventGrouping(
      {
        async json(request, validate) {
          const response = await cache(llmFingerprint(request));
          assert.ok(response, 'Exact historical grouping cache missing');
          const result = validate(response);
          groupingHits++;
          return result;
        },
      },
      config.haiku,
    );
    const matches = await groupShortlist(
      grouping,
      saved.id,
      shortlist,
      'verification-cache-only',
    );
    assert.equal(groupingHits, 1, 'Historical grouping was not validated');
    const ranked = rank(shortlist, start, end, 10, matches);
    const requests: LlmRequest[] = [];
    const editor = new ShortlistEditor(
      {
        json(request) {
          requests.push(request);
          return Promise.resolve(null);
        },
      },
      config.sonnet,
      config.haiku,
    );
    await editor.edit(
      input.topic,
      ranked,
      topic.story_budget,
      'verification-cache-only',
    );
    assert.equal(requests.length, 2);
    await writeFile(
      output,
      JSON.stringify(
        {
          editionId: rows[0].id,
          provenance:
            'All grouping/editor pool inputs match historical triage fingerprints; any unmatched inputs rank strictly below forty verified candidates using immutable saved scores. Exact historical grouping cache validated. Rejected responses were not retained. Requests below are initial requests, not historical repair prompts.',
          unresolvedOutsidePool: unresolved,
          scoredCandidates: scores.length,
          groupingPool: shortlist.length,
          requests,
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600, flag: 'wx' },
    );
    console.log(
      JSON.stringify({
        scoredCandidates: scores.length,
        recoveredSources,
        groupingPool: shortlist.length,
        editorCandidates: ranked.length,
        groupingHits,
        providerCalls: 0,
        output,
      }),
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
    await pool.end();
  }
}
void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Reconstruction failed',
  );
  process.exitCode = 1;
});
