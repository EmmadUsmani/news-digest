// Offline evidence for STEERING 36. No environment, database or provider access.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { relevancePolicySchema } from '@digest/contracts';

import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { costMicros } from '../apps/api/src/modules/curation/domain/budget';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import { groupShortlist } from '../apps/api/src/modules/digests/application/group-shortlist';
import { editorialShortlist } from '../apps/api/src/modules/digests/domain/editorial-shortlist';
import { qualityRejection } from '../apps/api/src/modules/digests/domain/quality';
import {
  type Candidate,
  rank,
} from '../apps/api/src/modules/digests/domain/rank';
import { assessRelevance } from '../apps/api/src/modules/digests/domain/relevance';

interface Window {
  editionId: string;
  windowStart: string;
  windowEnd: string;
  topicId: string;
  policy: unknown;
  scores: { id: string; relevance: number; importance: number }[];
  candidates: Candidate[];
  reviewedStories: { label: string; ids: string[] }[];
}

async function main() {
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-story-pool-2026-11-04-05.json',
      'utf8',
    ),
  ) as { windows: Window[] };
  // Explicit default-price scenario; never picks up operational env overrides.
  const config = llmConfig({});
  const prices = config.haiku;
  for (const window of fixture.windows) {
    const policy = relevancePolicySchema.parse(window.policy);
    const start = new Date(window.windowStart);
    const end = new Date(window.windowEnd);
    const membership = new Map<string, number>();
    for (const [index, story] of window.reviewedStories.entries()) {
      for (const id of story.ids) {
        assert.ok(!membership.has(id), 'Repeated reviewed membership');
        membership.set(id, index);
      }
    }
    assert.equal(membership.size, 40);
    assert.equal(window.candidates.length, 40);
    assert.equal(window.scores.length, 40);
    assert.ok(window.candidates.every((c) => membership.has(c.id)));
    const candidates = window.scores
      .filter((s) => s.relevance >= 6 && s.importance >= 4)
      .sort(
        (a, b) =>
          b.importance - a.importance ||
          b.relevance - a.relevance ||
          a.id.localeCompare(b.id),
      )
      .map((s) => window.candidates.find((c) => c.id === s.id)!);
    assert.ok(
      candidates.every(
        (c) =>
          !qualityRejection(c) &&
          assessRelevance(c, { ...policy, includeAny: [] }).eligible,
      ),
    );
    assert.deepEqual(
      editorialShortlist(
        window.candidates,
        window.scores,
        policy,
        start,
        end,
      ).shortlist.map((c) => c.id),
      candidates.slice(0, 10).map((c) => c.id),
      'Production article limit changed; refresh the before comparison',
    );
    // Exercise the prepared production selection and grouping wrapper with reviewed
    // memberships, not model output. Publication now explicitly selects forty;
    // the helper default retains the ten-article baseline for this comparison.
    const prepared = editorialShortlist(
      window.candidates,
      window.scores,
      policy,
      start,
      end,
      undefined,
      40,
    );
    assert.deepEqual(prepared.shortlist, candidates);
    const preparedMatches = await groupShortlist(
      {
        group(_topic, items) {
          assert.equal(items.length, 40);
          return Promise.resolve(
            window.reviewedStories
              .map((story) => story.ids)
              .filter((ids) => ids.length > 1),
          );
        },
      },
      window.topicId,
      prepared.shortlist,
      'offline-reviewed-labels',
    );
    const preparedRanked = rank(
      prepared.shortlist,
      start,
      end,
      10,
      preparedMatches,
    );
    assert.equal(
      preparedRanked.length,
      window.windowEnd.startsWith('2026-11-04') ? 7 : 10,
    );
    const results = [];
    for (const size of [10, 20, 30, 40]) {
      const pool = candidates.slice(0, size);
      const matches = (a: Candidate, b: Candidate) =>
        membership.get(a.id) === membership.get(b.id);
      const grouped = rank(pool, start, end, 10, matches);
      let request: LlmRequest | undefined;
      const grouping = new EventGrouping(
        {
          json<T>(value: LlmRequest): Promise<T | null> {
            request = value;
            return Promise.resolve(null);
          },
        },
        prices,
      );
      await grouping.group(
        window.topicId,
        pool.map((c) => ({
          ...c,
          topicId: window.topicId,
          outlet: c.sources.join(', '),
        })),
        'offline-no-dispatch',
      );
      assert.ok(request, 'Pool rejected by the existing model adapter');
      const inputBound =
        Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048;
      const groupingReservationMicros = costMicros(
        {
          input: inputBound,
          output: request.maxOutputTokens,
          cacheRead: 0,
          cacheWrite: 0,
        },
        {
          ...prices,
          input: Math.max(prices.input, prices.cacheWrite, prices.cacheRead),
        },
      );
      results.push({
        poolArticles: size,
        reviewedStories: new Set(pool.map((c) => membership.get(c.id))).size,
        editorCandidatesAfterGrouping: grouped.length,
        editorCandidateBytes: Buffer.byteLength(
          JSON.stringify(
            grouped.map((c) => ({
              id: c.id,
              title: c.title.slice(0, 300),
              excerpt: c.excerpt?.slice(0, 600) ?? null,
              sources: c.sources.slice(0, 3).map((s) => s.slice(0, 80)),
            })),
          ),
          'utf8',
        ),
        groupingInputByteBound: inputBound,
        groupingReservationMicros,
      });
    }
    assert.deepEqual(
      results.map((r) => r.reviewedStories),
      window.windowEnd.startsWith('2026-11-04') ? [1, 5, 5, 7] : [2, 6, 10, 13],
    );
    assert.ok(results.every((r) => r.editorCandidatesAfterGrouping <= 10));
    console.log(JSON.stringify({ editionId: window.editionId, results }));
  }
}
void main();
