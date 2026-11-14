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

const fixture = JSON.parse(
  readFileSync(
    'apps/api/test/fixtures/tech-evidence-cutoff-2026-11-14.json',
    'utf8',
  ),
) as {
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
  item.clusterEvidence.some((member) => member.excerpt.trim());
const semantic = (item: (typeof evidence)[number]) =>
  fixture.scores
    .filter((score) => item.coverage.some((member) => member.id === score.id))
    .sort(
      (a, b) =>
        b.importance - a.importance ||
        b.relevance - a.relevance ||
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
assert(challenger, 'Expected qualified reporting below cutoff');
const trial = [...baseline.slice(0, 9), challenger];
const walletId = 'd8bc8db4-79c4-42cf-9c43-511d08feafb7';
assert(challenger.coverage.some((member) => member.id === walletId));
assert.equal(baseline.filter(readable).length, 1);
assert.equal(trial.filter(readable).length, 2);
assert.equal(trial.length, baseline.length);
assert.equal(new Set(trial.map((item) => item.id)).size, 10);
for (const id of fixture.publishedIds) {
  assert(baseline.some((item) => item.id === id));
  assert(
    trial.some((item) => item.id === id),
    'Published headline-only control lost',
  );
}
for (const item of trial) {
  assert.deepEqual(
    item,
    evidence.find((original) => original.id === item.id),
  );
}
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
      clusters: all.length,
      baselineReadable: 1,
      trialReadable: 2,
      publishedControlsRetained: fixture.publishedIds.length,
      admitted: describe(challenger),
      displaced: describe(baseline[9]),
      productionChanged: false,
    },
    null,
    2,
  ),
);
