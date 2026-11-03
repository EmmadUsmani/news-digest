import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { relevancePolicySchema } from '@digest/contracts';

import { editionEventMatcher } from '../src/modules/digests/adapters/event-grouping';
import { sameEvent } from '../src/modules/digests/domain/cluster';
import { editorialShortlist } from '../src/modules/digests/domain/editorial-shortlist';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';
import { sameEventWithStudioClosure } from '../src/modules/digests/domain/studio-event';

const start = new Date('2026-11-02');
const end = new Date('2026-11-03');
const item = (id: string, title: string, hour: number): Candidate => ({
  id,
  title,
  excerpt: '',
  publishedAt: `2026-11-02T${hour}:00:00Z`,
  sources: [id],
  url: `https://example.org/${id}`,
  points: 0,
});

void test('opt-in ranking groups before slot limits, retains best lead and coverage without a score bonus', () => {
  const lead = item('lead', 'Copper Studio shuts down after funding cuts', 20);
  const alternate = item('alternate', 'Copper Studio is closed', 19);
  const unrelated = item('other', 'Silver Studio closes its doors', 18);
  const candidates = [alternate, unrelated, lead];
  const baseline = rank(candidates, start, end, 2);
  assert.deepEqual(baseline, rank(candidates, start, end, 2, sameEvent));
  assert.deepEqual(
    baseline.map((story) => story.id),
    ['lead', 'alternate'],
  );
  const grouped = rank(candidates, start, end, 2, sameEventWithStudioClosure);
  assert.deepEqual(
    grouped.map((story) => story.id),
    ['lead', 'other'],
  );
  assert.deepEqual(
    grouped[0].coverage.map((article) => article.url),
    [lead.url, alternate.url],
  );
  assert.deepEqual(grouped[0].sources, ['alternate', 'lead']);
  assert.equal(grouped[0].score, baseline[0].score);
  assert.deepEqual(
    rank([...candidates].reverse(), start, end, 2, sameEventWithStudioClosure),
    grouped,
  );
  assert.equal(
    rank(candidates, start, end, 0, sameEventWithStudioClosure).length,
    0,
  );
});

void test('opt-in ranking cannot attach out-of-window or quality-rejected coverage', () => {
  const lead = item('lead', 'Copper Studio is closed', 20);
  const candidates = [
    lead,
    {
      ...item('excluded', 'Copper Studio is closed', 19),
      publishedAt: end.toISOString(),
    },
    item('spam', 'Copper Studio is closed: buying guide', 19),
  ];
  const grouped = rank(candidates, start, end, 2, sameEventWithStudioClosure);
  assert.deepEqual(
    grouped.flatMap((story) => story.coverage.map((article) => article.id)),
    ['lead'],
  );
});

void test('recorded Gaming closure retains three outlet links in one ranked slot only when opted in', () => {
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/event-grouping-gaming-2026-11-02.json'),
      'utf8',
    ),
  ) as { candidates: Candidate[] };
  const baseline = rank(fixture.candidates, start, end, 20);
  const grouped = rank(
    fixture.candidates,
    start,
    end,
    20,
    sameEventWithStudioClosure,
  );
  const closure = grouped.find((story) =>
    story.coverage.some((article) => article.title.includes('Nagoshi')),
  )!;
  assert.ok(closure);
  assert.equal(closure.coverage.length, 3);
  assert.equal(closure.sources.length, 3);
  assert.ok(baseline.every((story) => story.coverage.length === 1));
  assert.equal(
    closure.score,
    baseline.find((story) => story.id === closure.id)!.score,
  );
  assert.ok(
    closure.reasons.some((reason) =>
      reason.includes('independence unverified'),
    ),
  );
});

void test('edition grouping requires exact opt-in and retains lexical fallback', () => {
  for (const value of ['', '0', 'true', 'yes', ' 1', '1 '])
    assert.equal(editionEventMatcher(value), sameEvent);
  assert.equal(editionEventMatcher('1'), sameEventWithStudioClosure);
});

void test('AI shortlist uses the edition matcher only after semantic eligibility', () => {
  const candidates = [
    item('lead', 'Copper Studio shuts down after funding cuts', 20),
    item('alternate', 'Copper Studio is closed', 19),
    item('irrelevant', 'Copper Studio is closed', 18),
    item('unscored', 'Copper Studio is closed', 17),
    item('other', 'Silver Studio closes its doors', 16),
  ];
  const scores = candidates
    .filter((c) => c.id !== 'unscored')
    .map((c) => ({
      id: c.id,
      relevance: c.id === 'irrelevant' ? 2 : 9,
      importance: 8,
    }));
  const policy = relevancePolicySchema.parse({
    includeAny: [],
    excludeAny: [],
  });
  const baseline = editorialShortlist(candidates, scores, policy, start, end);
  assert.deepEqual(
    baseline,
    editorialShortlist(
      candidates,
      scores,
      policy,
      start,
      end,
      editionEventMatcher('0'),
    ),
  );
  const grouped = editorialShortlist(
    candidates,
    scores,
    policy,
    start,
    end,
    editionEventMatcher('1'),
  );
  assert.deepEqual(grouped.shortlist, baseline.shortlist);
  assert.equal(baseline.ranked.length, 3);
  assert.equal(grouped.ranked.length, 2);
  assert.deepEqual(
    grouped.ranked[0].coverage.map((c) => c.id),
    ['lead', 'alternate'],
  );
  assert.equal(grouped.ranked[0].score, baseline.ranked[0].score);
});
