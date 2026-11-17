import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { techAdmissionControl } from '../../../scripts/lib/tech-admission-control';

const recorded = JSON.parse(
  readFileSync(
    new URL('./fixtures/tech-admission-2026-11-17.json', import.meta.url),
    'utf8',
  ),
) as {
  ranked: { id: string; title: string; coverage: { id: string }[] }[];
  scores: { id: string; importance: number; relevance: number }[];
  publishedEditorIds: string[];
};
const input = {
  ...recorded,
  enabled: true,
  topic: 'tech',
  grouping: 'validated' as const,
  triage: 'complete' as const,
};

void test('recorded bounded control admits California/Google and retains Windows with exactly two displacements', () => {
  assert.equal(recorded.ranked.length, 21);
  assert.equal(
    recorded.ranked.reduce((n, event) => n + event.coverage.length, 0),
    40,
  );
  assert.deepEqual(
    recorded.ranked.slice(0, 10).map((event) => event.id),
    recorded.publishedEditorIds,
  );
  const result = techAdmissionControl(input);
  assert.deepEqual(
    result.reserved.map(
      (id) => recorded.ranked.find((e) => e.id === id)!.title,
    ),
    [
      'California sues OpenAI over artificial intelligence models - The Black Chronicle',
      'In a first, Google detects AI-automated cyberattack - upi',
    ],
  );
  assert.deepEqual(
    result.displaced,
    recorded.ranked.slice(8, 10).map((e) => e.id),
  );
  assert.equal(result.admitted.length, 10);
  assert.equal(result.admitted[0], recorded.ranked[0]);
  assert.match(result.admitted[0].title, /Windows/);
  for (const event of result.admitted)
    assert.equal(
      event,
      recorded.ranked.find((e) => e.id === event.id),
    );
  assert.equal(
    new Set(result.admitted.flatMap((e) => e.coverage.map((c) => c.id))).size,
    result.admitted.reduce((n, e) => n + e.coverage.length, 0),
  );
});

void test('control is off by default and failures/non-Tech keep the exact baseline', () => {
  for (const change of [
    { enabled: undefined },
    { enabled: false },
    { topic: 'nba' },
    { topic: 'world' },
    { grouping: 'failed' as const },
    { grouping: 'unavailable' as const },
    { triage: 'failed' as const },
    { triage: 'incomplete' as const },
  ]) {
    const result = techAdmissionControl({ ...input, ...change });
    assert.deepEqual(result.admitted, recorded.ranked.slice(0, 10));
    assert.deepEqual(result.reserved, []);
    assert.deepEqual(result.reservations, []);
  }
});

void test('zero/one/two changes and short pools preserve rank order, identities and eligible membership', () => {
  const ranked = Array.from({ length: 12 }, (_, i) => ({
    id: `event-${i.toString().padStart(2, '0')}`,
    coverage: [
      { id: `member-${i}` },
      { id: `event-${i.toString().padStart(2, '0')}` },
    ],
    evidence: { url: `https://example.com/${i}` },
  }));
  const baseScores = ranked.flatMap((e) =>
    e.coverage.map((c) => ({ id: c.id, importance: 4, relevance: 6 })),
  );
  const tied = techAdmissionControl({ ...input, ranked, scores: baseScores });
  assert.deepEqual(tied.reserved, ['event-00', 'event-01']);
  assert.deepEqual(
    techAdmissionControl({
      ...input,
      ranked: [...ranked].reverse(),
      scores: baseScores,
    }).reserved,
    tied.reserved,
  );
  for (const promoted of [
    [0, 1],
    [0, 11],
    [10, 11],
  ]) {
    const scores = baseScores.map((s) => ({
      ...s,
      importance: promoted.some((i) => s.id === `member-${i}`) ? 10 : 4,
    }));
    const result = techAdmissionControl({ ...input, ranked, scores });
    assert.equal(
      result.displaced.length,
      promoted.filter((i) => i >= 10).length,
    );
    assert.deepEqual(
      result.admitted,
      ranked.filter((e) => result.admitted.includes(e)),
    );
    assert.ok(result.admitted.every((e) => ranked.includes(e)));
    assert.deepEqual(
      techAdmissionControl({ ...input, ranked, scores: [...scores].reverse() }),
      result,
    );
    // Membership order cannot change tie resolution or coverage transport.
    const reversed = ranked.map((e) => ({
      ...e,
      coverage: [...e.coverage].reverse(),
    }));
    assert.deepEqual(
      techAdmissionControl({ ...input, ranked: reversed, scores }).reserved,
      result.reserved,
    );
  }
  for (const length of [0, 1, 5, 10])
    assert.deepEqual(
      techAdmissionControl({
        ...input,
        ranked: ranked.slice(0, length),
        scores: baseScores,
      }).admitted,
      ranked.slice(0, length),
    );
});

void test('ambiguous groups and incomplete/invalid eligible scores refuse reservations', () => {
  const first = recorded.ranked[0];
  for (const change of [
    { ranked: [...recorded.ranked, first] },
    {
      ranked: [
        ...recorded.ranked.slice(0, 1),
        { ...recorded.ranked[1], coverage: first.coverage },
        ...recorded.ranked.slice(2),
      ],
    },
    { scores: recorded.scores.slice(1) },
    { scores: [...recorded.scores, recorded.scores[0]] },
    {
      scores: recorded.scores.map((s, i) =>
        i ? s : { ...s, importance: NaN },
      ),
    },
    { scores: recorded.scores.map((s, i) => (i ? s : { ...s, relevance: 5 })) },
  ]) {
    const candidate = { ...input, ...change };
    const result = techAdmissionControl(candidate);
    assert.deepEqual(result.admitted, candidate.ranked.slice(0, 10));
    assert.deepEqual(result.reserved, []);
    assert.deepEqual(result.reservations, []);
  }
});

void test('reservation receipts identify the winning member without replacing the ranked lead', () => {
  const result = techAdmissionControl(input);
  assert.deepEqual(
    result.reservations.map((receipt) => receipt.eventId),
    result.reserved,
  );
  for (const receipt of result.reservations) {
    const event = recorded.ranked.find(
      (candidate) => candidate.id === receipt.eventId,
    )!;
    const score = recorded.scores.find(
      (candidate) => candidate.id === receipt.memberId,
    )!;
    assert.ok(event.coverage.some((member) => member.id === receipt.memberId));
    assert.equal(receipt.importance, score.importance);
    assert.equal(receipt.relevance, score.relevance);
    assert.equal(receipt.baselineRank, null);
    assert.equal(
      result.admitted.find((candidate) => candidate.id === event.id),
      event,
    );
  }
  // California's strongest semantic report is not the ranked representative.
  assert.notEqual(
    result.reservations[0].memberId,
    result.reservations[0].eventId,
  );
  const ranked = recorded.ranked.slice(0, 2);
  const short = techAdmissionControl({ ...input, ranked });
  for (const receipt of short.reservations)
    assert.equal(
      receipt.baselineRank,
      ranked.findIndex((event) => event.id === receipt.eventId) + 1,
    );
  assert.deepEqual(
    techAdmissionControl({ ...input, scores: [...input.scores].reverse() })
      .reservations,
    result.reservations,
  );
});
