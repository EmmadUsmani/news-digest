import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateEventGrouping } from '../scripts/evaluate-event-grouping';
import {
  clusterCandidates,
  sameEvent,
} from '../src/modules/digests/domain/cluster';
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
  assert.equal(baseline.truePositives, 6);
  assert.equal(prepared.truePositives, 10);
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

void test('score attribution survives loser-first order and overrides lexical similarity', () => {
  const winnerFirst = item('Rapid Recap: Cavaliers 136, Bucks 111');
  const loserFirst = item('Rapid Recap: Bucks 111, Cavaliers 136');
  assert.equal(sameEventWithGameScore(winnerFirst, loserFirst), true);
  assert.equal(sameEventWithGameScore(loserFirst, winnerFirst), true);
  const opposite = item('Rapid Recap: Cavaliers 111, Bucks 136');
  assert.equal(sameEventWithGameScore(winnerFirst, opposite), false);
  assert.equal(sameEventWithGameScore(opposite, winnerFirst), false);
  for (const title of [
    'Bucks fall to Cavaliers 136-111',
    'Bucks lose to Cavaliers 136-111',
    'Bucks defeated by Cavaliers 136-111',
    'Bucks and Cavaliers 136-111: game recap',
    'Bucks beat Cavaliers 111-136',
  ]) {
    assert.equal(
      sameEventWithGameScore(winnerFirst, item(title)),
      false,
      title,
    );
    assert.equal(
      sameEventWithGameScore(item(title), winnerFirst),
      false,
      title,
    );
  }
  assert.equal(
    sameEventWithGameScore(
      winnerFirst,
      item(loserFirst.title, '2026-11-02T07:00:00Z'),
    ),
    false,
    'lexical similarity cannot bypass the game time bound',
  );
});

void test('uncertain and historical game reports cannot regain eligibility through lexical fallback', () => {
  for (const title of [
    'Cavaliers Bucks game preview and injury report',
    'Cavaliers Bucks prediction for the upcoming game',
    'Cavaliers Bucks game recap from last season',
    'Cavaliers Bucks played this game years ago',
    'Could Cavaliers beat Bucks 136-111?',
    'Cavaliers might beat Bucks 136-111',
    'Cavaliers did not beat Bucks 136-111',
  ]) {
    const left = item(title);
    const right = { ...item(title), id: 'second-outlet' };
    assert.equal(sameEvent(left, right), true, 'exercise lexical fallthrough');
    assert.equal(sameEventWithGameScore(left, right), false, title);
    assert.equal(sameEventWithGameScore(right, left), false, title);
    assert.equal(
      clusterCandidates([left, right], sameEventWithGameScore).length,
      2,
    );
  }
  const news = item('New developer tools preview improves game rendering');
  assert.equal(
    sameEventWithGameScore(news, { ...news, id: 'other' }),
    true,
    'NBA guard does not reject unrelated preview coverage',
  );
});

void test('ambiguous or implausible two-team scores cannot use lexical fallback', () => {
  for (const title of [
    'Bucks fall to Cavaliers 136-111',
    'Bucks and Cavaliers 136-111: game recap',
    'Bucks beat Cavaliers 111-136',
    'Bucks beat Cavaliers 111-111',
    'Bucks beat Cavaliers 250-111',
    'Bucks beat Cavaliers 50-40',
    'Bucks beat Cavaliers 136-111 after a 110-110 tie',
  ]) {
    const left = item(title);
    const right = { ...left, id: 'second-outlet' };
    assert.equal(sameEvent(left, right), true);
    assert.equal(sameEventWithGameScore(left, right), false, title);
    assert.equal(sameEventWithGameScore(right, left), false, title);
    assert.equal(
      clusterCandidates([left, right], sameEventWithGameScore).length,
      2,
    );
  }
  const scoreless = item('Bucks Cavaliers game recap and player reactions');
  assert.equal(
    sameEventWithGameScore(scoreless, { ...scoreless, id: 'other' }),
    true,
  );
});

void test('past-tense active victories group without admitting passive or reversed outcomes', () => {
  const lead = item('Cavaliers 136, Bucks 111: final score');
  const recap = item('Cavs defeated the Bucks 136-111 in overtime');
  for (const [a, b] of [
    [lead, recap],
    [recap, lead],
  ]) {
    assert.equal(sameEventWithGameScore(a, b), true);
    assert.deepEqual(clusterCandidates([a, b], sameEventWithGameScore), [
      [a, b],
    ]);
  }
  for (const title of [
    'Bucks defeated the Cavs 136-111 in overtime',
    'Cavs were defeated by Bucks 136-111',
    'Cavs were defeated in overtime by Bucks 136-111',
    'Cavs defeated the Bucks 136-111 last season',
    'Cavs could have defeated the Bucks 136-111',
    'Cavs defeated the Bucks 111-136',
    'Cavs beat Bucks 136-111 after being defeated',
    'Cavs defeated Bucks 136-111 after being defeated',
  ]) {
    const other = item(title);
    for (const [a, b] of [
      [lead, other],
      [other, lead],
    ]) {
      assert.equal(sameEventWithGameScore(a, b), false, title);
      assert.equal(clusterCandidates([a, b], sameEventWithGameScore).length, 2);
    }
  }
});
