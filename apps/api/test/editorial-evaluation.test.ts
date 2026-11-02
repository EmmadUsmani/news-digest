import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateEditorialWindow } from '../scripts/evaluate-editorial';
import { editorialShortlist } from '../src/modules/digests/domain/editorial-shortlist';
import type { Candidate } from '../src/modules/digests/domain/rank';

void test('recorded AI selection replays without services and accounts for each labeled event', () => {
  const report = evaluateEditorialWindow();
  assert.equal(report.candidates, 52);
  assert.equal(report.events.length, 5);
  assert.equal(report.forbiddenSelected.length, 0);
  assert.equal(
    report.eventRecall,
    report.events.filter((e) => e.selected).length / 5,
  );
  assert.equal(
    report.targetSlotYield,
    report.events.filter((e) => e.selected).length / report.selected.length,
  );
  assert.ok(report.events.every((e) => !e.selected || e.shortlisted));
  assert.equal(report.baseline.eventRecall, 0.4);
});

void test('semantic shortlist recovers missing include phrases but preserves exclusions, quality and thresholds', () => {
  const start = new Date('2026-11-01T00:00:00Z'),
    end = new Date('2026-11-02T00:00:00Z');
  const candidates: Candidate[] = [
    'recovered',
    'excluded',
    'quality',
    'irrelevant',
    'filler',
  ].map((id) => ({
    id,
    title:
      id === 'excluded'
        ? 'WNBA result'
        : id === 'quality'
          ? 'Ask HN: Basketball?'
          : 'Important result',
    excerpt: '',
    url:
      id === 'quality'
        ? 'https://news.ycombinator.com/item?id=1'
        : 'https://example.com/' + id,
    sources: ['Recorded'],
    points: 0,
    publishedAt: '2026-11-01T12:00:00Z',
  }));
  const scores = candidates.map((c) => ({
    id: c.id,
    relevance: c.id === 'irrelevant' ? 5 : 10,
    importance: c.id === 'filler' ? 3 : 8,
  }));
  const output = editorialShortlist(
    candidates,
    scores,
    { includeAny: ['NBA'], excludeAny: ['WNBA'] },
    start,
    end,
  );
  assert.deepEqual(
    output.shortlist.map((s) => s.id),
    ['recovered'],
  );
  assert.deepEqual(
    output.ranked.map((s) => s.id),
    ['recovered'],
  );
  assert.deepEqual(
    editorialShortlist(
      candidates,
      [...scores].reverse(),
      { includeAny: ['NBA'], excludeAny: ['WNBA'] },
      start,
      end,
    ),
    output,
  );
});
