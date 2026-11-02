// Fully offline: replay saved inference through the production shortlist rules.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { relevancePolicySchema } from '@digest/contracts';
import { z } from 'zod';

import { editorialShortlist } from '../src/modules/digests/domain/editorial-shortlist';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { evaluateWindow } from './evaluate-ranking';

const snapshotSchema = z.object({
  fixture: z.enum([
    'ranking-nba-2026-11-01.json',
    'ranking-world-2026-11-01.json',
    'ranking-tech-2026-11-01.json',
  ]),
  fixtureSha256: z.string(),
  topic: z.object({ name: z.string().min(1) }),
  triage: z.object({
    scores: z.array(
      z.object({
        id: z.string(),
        relevance: z.number().int().min(0).max(10),
        importance: z.number().int().min(0).max(10),
        event: z.string().min(1).max(160),
        rationale: z.string().min(1).max(300),
      }),
    ),
    unscoredIds: z.array(z.string()).length(0),
  }),
  shortlistIds: z.array(z.string()).max(10),
  result: z.object({
    model: z.string(),
    stories: z
      .array(
        z.object({
          id: z.string(),
          evidenceIds: z.array(z.string()).min(1).max(10).optional(),
          headline: z.string(),
          summary: z.string(),
          whyItMatters: z.string(),
          rationale: z.string(),
        }),
      )
      .max(10),
  }),
  usage: z.object({
    calls: z.number().int().nonnegative(),
    costMicros: z.number().int().nonnegative(),
  }),
});

export function evaluateEditorialWindow(key: 'nba' | 'world' | 'tech' = 'nba') {
  const snapshot = snapshotSchema.parse(
    JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/editorial-${key}-2026-11-01.json`),
        'utf8',
      ),
    ),
  );
  const input = readFileSync(
    join(__dirname, '../test/fixtures', snapshot.fixture),
    'utf8',
  );
  assert.equal(
    createHash('sha256').update(input).digest('hex'),
    snapshot.fixtureSha256,
    'Candidate/label fixture changed since inference was recorded',
  );
  const fixture = JSON.parse(input) as {
    topic: string;
    candidates: Candidate[];
    relevancePolicy: unknown;
    budget: number;
    windowStart: string;
    windowEnd: string;
    events: { name: string; ids: string[] }[];
    mustOmit: { id: string; reason: string }[];
  };
  assert.equal(snapshot.fixture, `ranking-${key}-2026-11-01.json`);
  assert.equal(snapshot.topic.name, fixture.topic);
  const baseline = evaluateWindow(snapshot.fixture); // also validates existing event labels
  assert.deepEqual(
    snapshot.triage.scores.map((s) => s.id).sort(),
    fixture.candidates.map((c) => c.id).sort(),
    'Every recorded candidate must be scored exactly once',
  );
  const { ranked } = editorialShortlist(
    fixture.candidates,
    snapshot.triage.scores,
    relevancePolicySchema.parse(fixture.relevancePolicy),
    new Date(fixture.windowStart),
    new Date(fixture.windowEnd),
  );
  assert.deepEqual(
    ranked.map((s) => s.id),
    snapshot.shortlistIds,
    'Shortlist behavior drift',
  );
  const selected = snapshot.result.stories;
  assert.ok(selected.length <= fixture.budget);
  assert.equal(new Set(selected.map((s) => s.id)).size, selected.length);
  assert.ok(
    selected.every((s) => ranked.some((r) => r.id === s.id)),
    'Unknown selection',
  );
  for (const story of selected) {
    if (key !== 'nba')
      assert.ok(story.evidenceIds, 'New snapshots require evidence IDs');
    if (story.evidenceIds) {
      assert.ok(story.evidenceIds.includes(story.id));
      assert.equal(new Set(story.evidenceIds).size, story.evidenceIds.length);
      assert.ok(
        story.evidenceIds.every((id) => ranked.some((r) => r.id === id)),
      );
    }
  }
  const selectedIds = new Set(
    ranked
      .filter((r) => selected.some((s) => s.id === r.id))
      .flatMap((r) => r.coverage.map((c) => c.id)),
  );
  const events = fixture.events.map((event) => ({
    name: event.name,
    shortlisted: ranked.some((r) =>
      r.coverage.some((c) => event.ids.includes(c.id)),
    ),
    selected: event.ids.some((id) => selectedIds.has(id)),
    scores: snapshot.triage.scores.filter((s) => event.ids.includes(s.id)),
  }));
  const found = events.filter((e) => e.selected).length;
  return {
    topic: snapshot.topic.name,
    windowStart: fixture.windowStart,
    windowEnd: fixture.windowEnd,
    labelCaveat:
      'Provisional agent labels from excerpts; target slot yield is not precision or factual verification.',
    candidates: fixture.candidates.length,
    selected,
    evidenceInputs: selected.map((story) => ({
      storyId: story.id,
      // v1 NBA did not record evidence IDs; do not infer historical citations.
      recorded: story.evidenceIds !== undefined,
      candidates: (story.evidenceIds ?? []).map((id) => {
        const candidate = fixture.candidates.find((c) => c.id === id)!;
        return {
          id,
          title: candidate.title.slice(0, 300),
          excerpt: candidate.excerpt?.slice(0, 600) ?? null,
          sources: candidate.sources.slice(0, 3).map((s) => s.slice(0, 80)),
          url: candidate.url,
        };
      }),
    })),
    events,
    eventRecall: found / fixture.events.length,
    targetSlotYield: selected.length ? found / selected.length : 0,
    forbiddenSelected: fixture.mustOmit.filter((c) => selectedIds.has(c.id)),
    baseline: {
      eventRecall: baseline.eventRecall,
      targetSlotYield: baseline.targetSlotYield,
    },
    model: snapshot.result.model,
    recordedUsage: snapshot.usage,
  };
}
if (require.main === module)
  console.log(
    JSON.stringify(
      ['nba', 'world', 'tech'].map((key) =>
        evaluateEditorialWindow(key as 'nba' | 'world' | 'tech'),
      ),
      null,
      2,
    ),
  );
