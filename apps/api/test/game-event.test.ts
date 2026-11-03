import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import { clusterCandidates } from '../src/modules/digests/domain/cluster';
import { sameEventWithGameScore } from '../src/modules/digests/domain/game-event';
import type { Candidate } from '../src/modules/digests/domain/rank';

const item = (
  title: string,
  publishedAt = '2026-11-01T12:00:00Z',
): Candidate => ({
  id: title,
  title,
  publishedAt,
  url: 'https://example.org/report',
  sources: ['Example'],
  excerpt: '',
  points: 0,
});

void test('opt-in game matcher improves recorded recall without recorded false merges', () => {
  const baseline = evaluateEventGrouping();
  const prepared = evaluateEventGrouping(sameEventWithGameScore);
  assert.equal(baseline.truePositives, 1);
  assert.equal(prepared.truePositives, 4);
  assert.equal(prepared.falsePositives, 0);
  assert.equal(prepared.precision, 1);
});

void test('game scores require matching teams, outcomes, bounded time and unambiguous reports', () => {
  const lead = item('Rapid Recap: Cavaliers 136, Bucks 111');
  const coverage = item('Diving deeper into Cavs 136-111 win over Bucks');
  assert.equal(sameEventWithGameScore(lead, coverage), true);
  for (const other of [
    item('Bucks 136, Cavaliers 111: dominant victory'),
    item('Cavs 137-111 win over Bucks'),
    item('Spurs 136-111 win over Wolves'),
    item('Cavs win over Bucks'),
    item('Cavs 136-111 win over Bucks and Lakers 110-105 win over Spurs'),
    item('Preview: Cavs 136-111 Bucks prediction'),
    item(coverage.title, '2026-11-02T12:00:00Z'),
    item(coverage.title, 'invalid'),
  ]) {
    assert.equal(sameEventWithGameScore(lead, other), false, other.title);
    assert.equal(sameEventWithGameScore(other, lead), false, other.title);
  }
  assert.equal(
    clusterCandidates([lead, coverage]).length,
    2,
    'default stays unchanged',
  );
  assert.deepEqual(
    clusterCandidates([lead, coverage], sameEventWithGameScore),
    [[lead, coverage]],
  );
});
