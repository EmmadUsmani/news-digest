// Recorded-input counterfactual only. No database, environment or provider access.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { relevancePolicySchema } from '@digest/contracts';

import { editorEvidence } from '../apps/api/src/modules/digests/application/editor-evidence';
import { editorialShortlist } from '../apps/api/src/modules/digests/domain/editorial-shortlist';
import {
  type Candidate,
  rank,
} from '../apps/api/src/modules/digests/domain/rank';

function evaluate(path: string, groupingPath?: string) {
  const fixture = JSON.parse(readFileSync(path, 'utf8')) as {
    provenance: string;
    reportingIds: string[];
    nonReportingIds: string[];
    expected: {
      baselineReadable: number;
      trialReadable: number;
      publishedControlsRetained: number;
      baselinePublished: number;
      clusters: number;
      reservationSweep: number[][];
      semanticSweep: number[][];
    };
    editionId: string;
    windowStart: string;
    windowEnd: string;
    topicId: string;
    policy: unknown;
    scores: { id: string; importance: number; relevance: number }[];
    candidates: Candidate[];
    groups: string[][];
    publishedIds: string[];
    historicalGroupingCacheHit: boolean;
  };
  assert.equal(fixture.historicalGroupingCacheHit, false);
  if (groupingPath) {
    const grouping = JSON.parse(readFileSync(groupingPath, 'utf8')) as {
      provenance: string;
      groups: string[][];
      expected: typeof fixture.expected;
    };
    fixture.groups = grouping.groups;
    fixture.provenance = grouping.provenance;
    fixture.expected = grouping.expected;
  }
  const start = new Date(fixture.windowStart);
  const end = new Date(fixture.windowEnd);
  const { shortlist } = editorialShortlist(
    fixture.candidates,
    fixture.scores,
    relevancePolicySchema.parse(fixture.policy),
    start,
    end,
    undefined,
    40,
  );
  assert.equal(shortlist.length, 40);
  const memberships = new Map<string, number>();
  for (const [index, group] of fixture.groups.entries()) {
    assert(
      group.length >= 2,
      'Grouping controls must combine explicit members',
    );
    for (const id of group) {
      assert(shortlist.some((item) => item.id === id));
      assert(!memberships.has(id));
      memberships.set(id, index);
    }
  }
  const matches = (a: Candidate, b: Candidate) =>
    a.id !== b.id &&
    memberships.has(a.id) &&
    memberships.get(a.id) === memberships.get(b.id);
  const first = rank(shortlist, start, end, 20, matches);
  const seen = new Set(
    first.flatMap((item) => item.coverage.map((member) => member.id)),
  );
  const all = [
    ...first,
    ...rank(
      shortlist.filter((item) => !seen.has(item.id)),
      start,
      end,
      20,
      matches,
    ),
  ];
  const evidence = editorEvidence(all, shortlist).candidates;
  const baseline = evidence.slice(0, 10);
  const readable = (item: (typeof evidence)[number]) =>
    item.clusterEvidence.some(
      (member) =>
        fixture.reportingIds.includes(member.id) && member.excerpt.trim(),
    );
  const semantic = (
    item: (typeof evidence)[number],
    first: 'importance' | 'relevance' = 'importance',
  ) =>
    fixture.scores
      .filter((score) => item.coverage.some((member) => member.id === score.id))
      .sort(
        (a, b) =>
          b[first] - a[first] ||
          b[first === 'importance' ? 'relevance' : 'importance'] -
            a[first === 'importance' ? 'relevance' : 'importance'] ||
          a.id.localeCompare(b.id),
      )[0];
  // Study a single reserved reporting slot, without altering production selection.
  const challenger = evidence
    .slice(10)
    .filter(readable)
    .sort(
      (a, b) =>
        semantic(b).importance - semantic(a).importance ||
        semantic(b).relevance - semantic(a).relevance ||
        b.score - a.score ||
        a.id.localeCompare(b.id),
    )[0];
  if (!groupingPath)
    assert(challenger, 'Expected qualified reporting below cutoff');
  const trial = challenger
    ? [...baseline.slice(0, 9), challenger]
    : [...baseline];
  const retained = (pool: typeof baseline) =>
    fixture.publishedIds.filter((id) => pool.some((item) => item.id === id))
      .length;
  assert.equal(
    baseline.filter(readable).length,
    fixture.expected.baselineReadable,
  );
  assert.equal(trial.filter(readable).length, fixture.expected.trialReadable);
  assert.equal(all.length, fixture.expected.clusters);
  assert.equal(retained(baseline), fixture.expected.baselinePublished);
  assert.equal(retained(trial), fixture.expected.publishedControlsRetained);
  assert.equal(trial.length, baseline.length);
  assert.equal(new Set(trial.map((item) => item.id)).size, 10);
  for (const id of fixture.nonReportingIds) {
    const item = evidence.find((item) =>
      item.coverage.some((member) => member.id === id),
    );
    assert(
      item && item.clusterEvidence.some((member) => member.excerpt.trim()),
    );
    assert(
      !readable({
        ...item,
        clusterEvidence: item.clusterEvidence.filter(
          (member) => member.id === id,
        ),
      }),
      'Headline-list control must not count as reporting',
    );
  }
  for (const id of fixture.reportingIds)
    assert(shortlist.some((item) => item.id === id && item.excerpt.trim()));
  for (const item of trial) {
    assert.deepEqual(
      item,
      evidence.find((original) => original.id === item.id),
    );
  }
  // Compare the cost of reserving more evidence slots on the same fixed pool.
  // Labels are manually reviewed prose eligibility, not a runtime classifier.
  const reportingOrder = evidence
    .filter(readable)
    .sort(
      (a, b) =>
        semantic(b).importance - semantic(a).importance ||
        semantic(b).relevance - semantic(a).relevance ||
        b.score - a.score ||
        a.id.localeCompare(b.id),
    );
  const reservationSweep = [0, 1, 2, 3].map((reserved) => {
    const guaranteed = reportingOrder.slice(0, reserved);
    const guaranteedIds = new Set(guaranteed.map((item) => item.id));
    const pool = [
      ...evidence
        .filter((item) => !guaranteedIds.has(item.id))
        .slice(0, 10 - guaranteed.length),
      ...guaranteed,
    ];
    assert.equal(pool.length, 10);
    assert.equal(new Set(pool.map((item) => item.id)).size, 10);
    for (const item of pool)
      assert.deepEqual(
        item,
        evidence.find((original) => original.id === item.id),
      );
    if (reserved === 0) assert.deepEqual(pool, baseline);
    return {
      reserved,
      reporting: pool.filter(readable).length,
      publishedRetained: retained(pool),
      displacedPublished: fixture.publishedIds.filter(
        (id) =>
          baseline.some((item) => item.id === id) &&
          !pool.some((item) => item.id === id),
      ),
      added: pool
        .filter((item) => !baseline.includes(item))
        .map((item) => item.title),
    };
  });
  assert.deepEqual(
    reservationSweep.map((row) => [
      row.reporting,
      row.publishedRetained,
      row.added.length,
    ]),
    fixture.expected.reservationSweep,
  );
  // Test the identified cutoff cause without an oracle reporting reservation:
  // use saved semantic scores for admission, retaining the existing clusters.
  const semanticSweep = (['importance', 'relevance'] as const).map((first) => {
    const second = first === 'importance' ? 'relevance' : 'importance';
    const pool = [...evidence]
      .sort(
        (a, b) =>
          semantic(b, first)[first] - semantic(a, first)[first] ||
          semantic(b, first)[second] - semantic(a, first)[second] ||
          b.score - a.score ||
          a.id.localeCompare(b.id),
      )
      .slice(0, 10);
    assert.equal(pool.length, 10);
    assert.equal(new Set(pool.map((item) => item.id)).size, 10);
    for (const item of pool)
      assert.deepEqual(
        item,
        evidence.find((original) => original.id === item.id),
      );
    return {
      first,
      reporting: pool.filter(readable).length,
      publishedRetained: retained(pool),
      displacedPublished: fixture.publishedIds.filter(
        (id) =>
          baseline.some((item) => item.id === id) &&
          !pool.some((item) => item.id === id),
      ),
      added: pool
        .filter((item) => !baseline.includes(item))
        .map((item) => item.title),
    };
  });
  assert.deepEqual(
    semanticSweep.map((row) => [
      row.reporting,
      row.publishedRetained,
      row.added.length,
      row.displacedPublished.length,
    ]),
    fixture.expected.semanticSweep,
  );
  const describe = (item: (typeof evidence)[number]) => ({
    id: item.id,
    title: item.title,
    rankScore: item.score,
    semantic: semantic(item),
    reportingCharacters: item.clusterEvidence.reduce(
      (sum, member) => sum + member.excerpt.length,
      0,
    ),
  });
  console.log(
    JSON.stringify(
      {
        editionId: fixture.editionId,
        counterfactual: true,
        groupingControl: groupingPath ?? null,
        clusters: all.length,
        baselineReadable: baseline.filter(readable).length,
        trialReadable: trial.filter(readable).length,
        publishedControlsRetained: retained(trial),
        baselinePublished: retained(baseline),
        provenance: fixture.provenance,
        admitted: challenger ? describe(challenger) : null,
        displaced: challenger ? describe(baseline[9]) : null,
        reservationSweep,
        semanticSweep,
        productionChanged: false,
      },
      null,
      2,
    ),
  );
}
for (const date of ['2026-11-12', '2026-11-14'])
  evaluate(`apps/api/test/fixtures/tech-evidence-cutoff-${date}.json`);
evaluate(
  'apps/api/test/fixtures/tech-evidence-cutoff-2026-11-12.json',
  'apps/api/test/fixtures/tech-evidence-grouping-2026-11-12.json',
);
