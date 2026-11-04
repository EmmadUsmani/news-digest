import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type XComparisonRound,
  xExperimentComparison,
} from '../../../scripts/lib/x-experiment-comparison';
import { type XExperimentEvidence } from '../../../scripts/lib/x-experiment-report';
import { reportSavedXExperiment } from '../scripts/report-x-experiment';

function fixture(day = '04') {
  const topicIds = ['tech', 'nba', 'gaming', 'world'];
  const evidence: XExperimentEvidence[] = topicIds.flatMap((topicId) =>
    (['current', 'trending', 'reactions'] as const).map((style) => ({
      requestId: `${day}/${topicId}/${style}`,
      topicId,
      style,
      model: 'synthetic',
      window: {
        start: `2026-11-${day}T00:00:00Z`,
        end: `2026-11-${day}T18:00:00Z`,
      },
      costMicros: 50_000,
      postsFetched: 1,
      actualToolCalls: [],
      posts: [
        {
          id: '1',
          publishedAt: `2026-11-${day}T17:00:00Z`,
          likes: 100,
          relevance: 6,
          promotion: false,
        },
      ],
    })),
  );
  const round: XComparisonRound = {
    model: 'synthetic',
    topicIds,
    calls: evidence.map((call) => ({
      requestId: call.requestId,
      startedAt: `2026-11-${day}T19:00:00Z`,
    })),
  };
  return { evidence, round };
}

void test('comparison requires two full four-topic three-style rounds on separate days', () => {
  const first = fixture();
  const second = fixture('05');
  const report = xExperimentComparison(
    [...first.evidence, ...second.evidence],
    [first.round, second.round],
  );
  assert.equal(report.twoDayCoverage, true);
  assert.deepEqual(report.unassignedRequestIds, []);
  assert.ok(report.rounds.every((round) => round.complete));
  assert.deepEqual(report.rounds[0].styles[0], {
    style: 'current',
    costMicros: 200_000,
    eligiblePosts: 4,
    zeroPromotions: true,
    eligiblePostsPerDollar: 20,
  });
  assert.equal(
    xExperimentComparison(first.evidence, [first.round]).twoDayCoverage,
    false,
  );
  second.round.calls.forEach((call) => {
    call.startedAt = '2026-11-04T20:00:00Z';
  });
  assert.equal(
    xExperimentComparison(
      [...first.evidence, ...second.evidence],
      [first.round, second.round],
    ).twoDayCoverage,
    false,
  );
});

void test('missing or repeated cells, mismatched windows and hour overflow block coverage', () => {
  for (const mutate of [
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls.pop();
    },
    ({ evidence }: ReturnType<typeof fixture>) => {
      evidence[0].style = 'trending';
    },
    ({ evidence }: ReturnType<typeof fixture>) => {
      evidence[0].window.end = '2026-11-04T17:59:00Z';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls[0].startedAt = '2026-11-04T20:00:00.001Z';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls[0].startedAt = '2026-11-05T00:00:00Z';
    },
  ]) {
    const data = fixture();
    mutate(data);
    const report = xExperimentComparison(data.evidence, [data.round]);
    assert.equal(report.rounds[0].complete, false);
    assert.ok(
      report.rounds[0].styles.every(
        (style) => style.eligiblePostsPerDollar === null,
      ),
    );
  }
  const data = fixture();
  data.round.calls[0].startedAt = '2026-11-04T20:00:00Z';
  assert.equal(
    xExperimentComparison(data.evidence, [data.round]).rounds[0].complete,
    true,
  );
});

void test('unreviewed labels and promotions remain visible without inventing a winner', () => {
  const data = fixture();
  data.evidence[0].posts[0].promotion = null;
  data.evidence[1].posts[0].promotion = true;
  const report = xExperimentComparison(data.evidence, [data.round]);
  assert.equal(report.rounds[0].styles[0].eligiblePosts, null);
  assert.equal(report.rounds[0].styles[0].zeroPromotions, null);
  assert.equal(report.rounds[0].styles[1].zeroPromotions, false);
  assert.ok(!('winner' in report));
  assert.deepEqual(
    reportSavedXExperiment(data.evidence, [data.round]).comparison,
    report,
  );
});

void test('unknown, reused, mislabelled and ambiguous dispatch evidence is rejected', () => {
  for (const mutate of [
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls[0].requestId = 'absent';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls.push(round.calls[0]);
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.model = 'other';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.topicIds[0] = 'other';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.topicIds[0] = 'nba';
    },
    ({ round }: ReturnType<typeof fixture>) => {
      round.calls[0].startedAt = '2026-11-04T19:00:00';
    },
  ]) {
    const data = fixture();
    mutate(data);
    assert.throws(() => xExperimentComparison(data.evidence, [data.round]));
  }
  const data = fixture();
  assert.throws(() =>
    xExperimentComparison(data.evidence, [data.round, data.round]),
  );
  assert.throws(() =>
    reportSavedXExperiment(data.evidence, [{ ...data.round, extra: true }]),
  );
});

void test('equivalent timezones and valid empty search results preserve round coverage', () => {
  const data = fixture();
  data.evidence[0].window.start = '2026-11-03T17:00:00-07:00';
  data.round.calls[0].startedAt = '2026-11-04T12:00:00-07:00';
  data.evidence[0].posts = [];
  data.evidence[0].postsFetched = 0;
  const report = xExperimentComparison(data.evidence, [data.round]);
  assert.equal(report.rounds[0].complete, true);
  assert.equal(report.rounds[0].styles[0].eligiblePosts, 3);
  assert.equal(report.rounds[0].styles[0].zeroPromotions, true);
});
