import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import { llmFingerprint } from '../src/modules/curation/application/llm-fingerprint';
import type {
  LlmRequest,
  ModelPrice,
} from '../src/modules/curation/domain/llm.port';
import { groupShortlist } from '../src/modules/digests/application/group-shortlist';
import { editorialShortlist } from '../src/modules/digests/domain/editorial-shortlist';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

void test('recorded World grouping expands story diversity through production selection and validation', async () => {
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-story-pool-2026-11-04-05.json',
      'utf8',
    ),
  ) as {
    windows: {
      editionId: string;
      topicId: string;
      windowStart: string;
      windowEnd: string;
      policy: unknown;
      candidates: Candidate[];
      scores: { id: string; relevance: number; importance: number }[];
      reviewedStories: { label: string; ids: string[] }[];
    }[];
  };
  const recording = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/llm/world-story-pool-2026-11-05.json',
      'utf8',
    ),
  ) as {
    model: string;
    records: { fingerprint: string; response: unknown }[];
    windows: {
      editionId: string;
      poolArticles: number;
      editorCandidateIds: string[];
    }[];
  };
  const model: ModelPrice = {
    id: recording.model,
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
  };
  let replayed = 0;
  const grouping = new EventGrouping(
    {
      async json<T>(
        request: LlmRequest,
        validate: (value: unknown) => T,
      ): Promise<T | null> {
        const record = recording.records.find(
          (r) => r.fingerprint === llmFingerprint(request),
        );
        assert.ok(record, 'Changed request requires an explicit new recording');
        replayed++;
        return validate(record.response);
      },
    },
    model,
  );
  for (const [index, window] of fixture.windows.entries()) {
    const start = new Date(window.windowStart);
    const end = new Date(window.windowEnd);
    const labels = new Map(
      window.reviewedStories.flatMap((g) =>
        g.ids.map((id) => [id, g.label] as const),
      ),
    );
    const counts = [];
    for (const size of [10, 40] as const) {
      const { shortlist } = editorialShortlist(
        window.candidates,
        window.scores,
        relevancePolicySchema.parse(window.policy),
        start,
        end,
        undefined,
        size,
      );
      const matches = await groupShortlist(
        grouping,
        window.topicId,
        shortlist,
        'offline-replay',
      );
      const ranked = rank(shortlist, start, end, 10, matches);
      const expected = recording.windows.find(
        (w) => w.editionId === window.editionId && w.poolArticles === size,
      )!;
      assert.deepEqual(
        ranked.map((c) => c.id),
        expected.editorCandidateIds,
      );
      for (const story of ranked) {
        assert.equal(
          new Set(story.coverage.map((c) => labels.get(c.id))).size,
          1,
          'No cross-label coverage merges',
        );
      }
      counts.push(new Set(ranked.map((c) => labels.get(c.id))).size);
      if (size === 40) assert.equal(ranked.length, 10);
    }
    assert.deepEqual(counts, index === 0 ? [1, 5] : [2, 7]);
  }
  assert.equal(replayed, 4);
});
