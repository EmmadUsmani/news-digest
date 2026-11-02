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

for (const [key, candidates, baselineRecall] of [
  ['world', 47, 0.2],
  ['tech', 54, 0],
] as const) {
  void test(`recorded ${key} editorial replay accounts for all candidates, labels and evidence`, () => {
    const report = evaluateEditorialWindow(key);
    assert.equal(report.candidates, candidates);
    assert.equal(report.events.length, 5);
    assert.equal(report.forbiddenSelected.length, 0);
    assert.equal(
      report.eventRecall,
      report.events.filter((e) => e.selected).length / 5,
    );
    assert.equal(
      report.targetSlotYield,
      report.selected.length
        ? report.events.filter((e) => e.selected).length /
            report.selected.length
        : 0,
    );
    assert.ok(report.events.every((e) => !e.selected || e.shortlisted));
    assert.equal(report.baseline.eventRecall, baselineRecall);
    assert.equal(report.evidenceInputs.length, report.selected.length);
    for (const evidence of report.evidenceInputs) {
      assert.equal(evidence.recorded, true);
      assert.ok(evidence.candidates.some((c) => c.id === evidence.storyId));
      assert.ok(
        evidence.candidates.every(
          (c) => c.title.length <= 300 && (c.excerpt?.length ?? 0) <= 600,
        ),
      );
    }
    assert.ok(
      report.selected.every((story) => story.evidenceIds?.includes(story.id)),
    );
  });
}

void test('v3 recorded Tech replay preserves reported Apple findings without asserting company non-confirmation', () => {
  const before = evaluateEditorialWindow('tech');
  const after = evaluateEditorialWindow('tech', 'v3');
  assert.equal(after.candidates, before.candidates);
  assert.equal(after.eventRecall, before.eventRecall);
  assert.equal(after.forbiddenSelected.length, 0);
  const apple = after.evidenceInputs.find((entry) =>
    entry.candidates.some((c) => c.title.includes('HomeView')),
  );
  assert.ok(apple, 'Known factual-support case must remain selected');
  const original = before.selected.find((s) => s.id === apple.storyId)!;
  const revised = after.selected.find((s) => s.id === apple.storyId)!;
  assert.match(original.summary, /Apple has not confirmed/i);
  assert.doesNotMatch(revised.summary, /not confirmed|unconfirmed/i);
  assert.match(revised.summary, /according to The Verge/);
  assert.match(revised.summary, /reportedly/);
  // A frozen example documents one observed improvement, not entailment of
  // arbitrary future outputs or proof that the prompt enforces factuality.
});

void test('absence guard rejects remaining recorded v3 Apple and benchmark caveats', async () => {
  const { assertAbsenceSupport } =
    await import('../src/modules/curation/application/absence-support');
  const report = evaluateEditorialWindow('tech', 'v3');
  for (const [title, field] of [
    ['HomeView', 'whyItMatters'],
    ['HomeView', 'rationale'],
    ['Memdoor', 'summary'],
    ['Memdoor', 'rationale'],
  ] as const) {
    const input = report.evidenceInputs.find((e) =>
      e.candidates.some((c) => c.title.includes(title)),
    )!;
    const story = report.selected.find((s) => s.id === input.storyId)!;
    assert.throws(() =>
      assertAbsenceSupport(
        story[field],
        input.candidates.flatMap((c) => [c.title, c.excerpt ?? '']),
      ),
    );
  }
});

void test('v4 recorded Tech replay retains targets and passes absence checks across selected story text', async () => {
  const { assertAbsenceSupport } =
    await import('../src/modules/curation/application/absence-support');
  const report = evaluateEditorialWindow('tech', 'v4');
  assert.equal(report.eventRecall, 0.6);
  assert.equal(report.forbiddenSelected.length, 0);
  assert.equal(report.selected.length, 5);
  for (const story of report.selected) {
    const input = report.evidenceInputs.find((e) => e.storyId === story.id)!;
    assert.ok(input.candidates.some((c) => c.id === story.id));
    for (const field of [
      'headline',
      'summary',
      'whyItMatters',
      'rationale',
    ] as const)
      assert.doesNotThrow(() =>
        assertAbsenceSupport(
          story[field],
          input.candidates.flatMap((c) => [c.title, c.excerpt ?? '']),
        ),
      );
  }
});
