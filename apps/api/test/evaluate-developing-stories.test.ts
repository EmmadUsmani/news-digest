import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  evaluateDevelopingStories,
  type ReplayCase,
  replayFingerprint,
} from '../scripts/evaluate-developing-stories';
import { developingEvidence } from '../src/modules/digests/domain/developing-links';

const fixture = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/developing-stories-saved-2026-11-12-18.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { cases: ReplayCase[] };
function controls() {
  return fixture.cases.map((item) => {
    const evidence = developingEvidence(item.stories, item.history);
    return {
      editionId: item.editionId,
      topicId: item.topicId,
      inputSha256: replayFingerprint(item),
      groups: (
        item.reviews ?? [
          {
            storyId: item.reviewedStoryId!,
            expectedPredecessors: item.expectedPredecessors!,
          },
        ]
      )
        .filter((label) => label.expectedPredecessors.length)
        .map((label) => [
          evidence.find(
            (x) => x.editionId === null && x.story.id === label.storyId,
          )!.reference,
          ...label.expectedPredecessors.map(
            (p) =>
              evidence.find(
                (x) => x.editionId === p.editionId && x.story.id === p.storyId,
              )!.reference,
          ),
        ]),
    };
  });
}

void test('manual positive and negative controls pass offline replay; all linked pairs are exposed', async () => {
  const report = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(report.controlsPassed, true);
  assert.equal(
    report.cases.reduce((n, c) => n + c.links.length, 0),
    8,
  );
  assert.ok(report.cases.every((c) => c.status === 'replayed'));
});

void test('missing, invalid, empty and wrong recorded memberships fail acceptance', async () => {
  for (const variant of [
    'missing',
    'unknown',
    'duplicate',
    'empty',
    'wrong',
    'stale',
  ] as const) {
    const records = controls();
    if (variant === 'missing') records.shift();
    else if (variant === 'unknown') records[0].groups[0].push('history:999:0');
    else if (variant === 'duplicate')
      records[0].groups[0].push(records[0].groups[0][0]);
    else if (variant === 'stale') records[0].inputSha256 = '0'.repeat(64);
    else if (variant === 'empty') records[0].groups = [];
    else records[0].groups = [['current:0', 'history:0:0']];
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false, variant);
    assert.ok(
      report.cases.some((c) => c.acceptance === 'fail'),
      variant,
    );
  }
});

void test('unreviewed cases cannot certify acceptance; duplicate and orphan records reject', async () => {
  const cases = structuredClone(fixture.cases);
  delete cases[0].reviewedStoryId;
  delete cases[0].expectedPredecessors;
  delete cases[0].reviews;
  const report = await evaluateDevelopingStories(cases, controls());
  assert.equal(report.controlsPassed, false);
  assert.equal(report.cases[0].acceptance, 'unreviewed');
  const records = controls();
  await assert.rejects(
    evaluateDevelopingStories(fixture.cases, [...records, records[0]]),
    /Duplicate/,
  );
  await assert.rejects(
    evaluateDevelopingStories(fixture.cases, [
      { ...records[0], editionId: 'unknown' },
    ]),
    /no replay input/,
  );
});

void test('a correct nearest predecessor cannot hide a wrong older member', async () => {
  const records = controls();
  const index = fixture.cases.findIndex(
    (c) => c.expectedPredecessors!.length > 1,
  );
  const item = fixture.cases[index];
  const group = records[index].groups[0];
  const evidence = developingEvidence(item.stories, item.history);
  const wrong = evidence.find(
    (x) => x.editionId !== null && !group.includes(x.reference),
  )!;
  group[group.length - 1] = wrong.reference;
  const report = await evaluateDevelopingStories(fixture.cases, records);
  assert.equal(report.controlsPassed, false);
  assert.equal(report.cases[index].acceptance, 'fail');
});

void test('complete saved topic reviews detect false links and missed additional continuations', async () => {
  const index = fixture.cases.findIndex((item) => item.topicName === 'Gaming');
  const item = fixture.cases[index];
  const baseline = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(baseline.controlsPassed, true);
  assert.equal(baseline.cases[index].reviews.length, 5);
  assert.equal(baseline.cases[index + 1].reviews.length, 5);
  assert.equal(baseline.semanticAcceptance, 'not-established');
  // Keep the legacy Zelda control correct while omitting the separately reviewed GTA update.
  const omitted = controls();
  omitted[index].groups.shift();
  const missed = await evaluateDevelopingStories(fixture.cases, omitted);
  assert.equal(missed.controlsPassed, false);
  assert.equal(missed.cases[index].review?.acceptance, 'pass');
  assert.equal(missed.cases[index].reviews[0].acceptance, 'fail');

  const wrong = controls();
  const evidence = developingEvidence(item.stories, item.history);
  const nonmatch = item.reviews!.find(
    (label) => !label.expectedPredecessors.length,
  )!;
  const used = new Set(wrong[index].groups.flat());
  const unrelated = evidence.find(
    (entry) => entry.editionId !== null && !used.has(entry.reference),
  )!;
  wrong[index].groups.push([
    evidence.find(
      (entry) =>
        entry.editionId === null && entry.story.id === nonmatch.storyId,
    )!.reference,
    unrelated.reference,
  ]);
  const falseLink = await evaluateDevelopingStories(fixture.cases, wrong);
  assert.equal(falseLink.controlsPassed, false);
  assert.equal(falseLink.cases[index].review?.acceptance, 'pass');
  assert.equal(
    falseLink.cases[index].reviews.find(
      (review) => review.storyId === nonmatch.storyId,
    )?.acceptance,
    'fail',
  );
});

void test('complete review labels reject duplicates, missing history and conflicting legacy labels', async () => {
  for (const variant of [
    'duplicate',
    'unknown-current',
    'unknown-history',
    'duplicate-history',
    'conflict',
    'unordered',
  ] as const) {
    const cases = structuredClone(fixture.cases);
    const item = cases.find((entry) => entry.topicName === 'Gaming')!;
    const labels = item.reviews!;
    if (variant === 'duplicate') labels.push(labels[0]);
    if (variant === 'unknown-current') labels[0].storyId = 'missing';
    if (variant === 'unknown-history')
      labels[0].expectedPredecessors[0].storyId = 'missing';
    if (variant === 'duplicate-history')
      labels[0].expectedPredecessors.push(labels[0].expectedPredecessors[0]);
    if (variant === 'conflict') item.expectedPredecessors = [];
    if (variant === 'unordered') {
      const label = labels.find(
        (entry) => entry.expectedPredecessors.length > 1,
      )!;
      label.expectedPredecessors.reverse();
      item.expectedPredecessors = structuredClone(label.expectedPredecessors);
    }
    await assert.rejects(
      evaluateDevelopingStories(cases, controls()),
      /review labels/i,
      variant,
    );
  }
});

void test('complete Tech review rejects a Google research link while legacy Nvidia nonmatch passes', async () => {
  const index = fixture.cases.findIndex(
    (item) => item.reviews?.length === 5 && item.topicName === 'Tech & AI',
  );
  const records = controls();
  records[index].groups = [['current:3', 'history:5:1']];
  const report = await evaluateDevelopingStories(fixture.cases, records);
  assert.equal(report.controlsPassed, false);
  assert.equal(report.cases[index].review?.acceptance, 'pass');
  assert.equal(
    report.cases[index].reviews.find(
      (review) => review.storyId === fixture.cases[index].stories[3].id,
    )?.acceptance,
    'fail',
  );
});

void test('NBA injury nonmatches reject shared-player and shared-team links despite correct LeBron control', async () => {
  const index = fixture.cases.findIndex((item) => item.topicName === 'NBA');
  const item = fixture.cases[index];
  const baseline = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(baseline.cases[index].reviews.length, 3);
  assert.equal(baseline.controlsPassed, true);
  for (const [current, previous] of [
    ['current:2', 'history:6:1'], // Brown's trade dispute is not his hamstring injury.
    ['current:4', 'history:4:2'], // Gueye is not McCollum or Newell.
  ]) {
    const records = controls();
    records[index].groups.push([current, previous]);
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false);
    assert.equal(report.cases[index].review?.acceptance, 'pass');
    assert.equal(
      report.cases[index].reviews.filter(
        (review) => review.acceptance === 'fail',
      ).length,
      1,
    );
    assert.equal(report.semanticAcceptance, 'not-established');
  }
  assert.equal(
    item.reviews!.filter((review) => !review.expectedPredecessors.length)
      .length,
    2,
  );
});

void test('Nov 16 Tech nonmatches reject shared security and agent categories despite correct Nvidia links', async () => {
  const item = fixture.cases[0];
  const baseline = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(baseline.cases[0].reviews.length, 4);
  assert.equal(baseline.controlsPassed, true);
  for (const [current, previous] of [
    ['current:1', 'history:3:2'], // Aerospace intrusion is not Google's TPU security hardware.
    ['current:3', 'history:3:3'], // Healthcare trials are not United's agent-booking restriction.
    ['current:4', 'history:0:1'], // uBlock XSS is not the Lovable data exposure.
  ]) {
    const records = controls();
    records[0].groups.push([current, previous]);
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false);
    assert.equal(report.cases[0].review?.acceptance, 'pass');
    assert.equal(
      report.cases[0].reviews.filter((review) => review.acceptance === 'fail')
        .length,
      1,
    );
    assert.equal(report.semanticAcceptance, 'not-established');
  }
  assert.equal(
    item.reviews!.some((review) => review.storyId === item.stories[2].id),
    false,
  );
});

void test('Nov 17 Tech rejects category links without certifying unresolved chip-policy continuity', async () => {
  const index = 4;
  const item = fixture.cases[index];
  const baseline = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(baseline.controlsPassed, true);
  assert.equal(baseline.cases[index].reviews.length, 4);
  assert.equal(
    item.reviews!.some((r) => r.storyId === item.stories[3].id),
    false,
  );
  for (const [current, previous] of [
    ['current:0', 'history:0:3'], // Grok laptop actions are not OpenAI healthcare trials.
    ['current:1', 'history:1:0'], // Hassabis funding is not Anthropic's IPO.
    ['current:2', 'history:5:1'], // Apple permissions are not its local-model app.
    ['current:4', 'history:6:2'], // Optimizely is not the Fireworks incident.
  ]) {
    const records = controls();
    records[index].groups.push([current, previous]);
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false);
    assert.equal(
      report.cases[index].reviews.filter((r) => r.acceptance === 'fail').length,
      1,
    );
    assert.equal(report.semanticAcceptance, 'not-established');
  }
});

void test('Nov 15 Tech rejects shared security and chip subjects while retaining the IPO control', async () => {
  const index = 3;
  const baseline = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(baseline.controlsPassed, true);
  assert.equal(baseline.cases[index].reviews.length, 4);
  for (const [current, previous] of [
    ['current:1', 'history:4:2'],
    ['current:1', 'history:6:0'],
    ['current:3', 'history:6:2'],
    ['current:3', 'history:2:2'],
  ]) {
    const records = controls();
    records[index].groups.push([current, previous]);
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false);
    assert.equal(report.cases[index].review?.acceptance, 'pass');
    assert.equal(
      report.cases[index].reviews.filter((r) => r.acceptance === 'fail').length,
      1,
    );
    assert.equal(report.semanticAcceptance, 'not-established');
  }
});

void test('Nov 15 Huang recap requires every leadership predecessor and rejects chip-category links', async () => {
  for (const variant of ['missing', 'partial', 'chip']) {
    const records = controls();
    const groups = records[3].groups;
    const index = groups.findIndex((group) => group[0] === 'current:2');
    assert.ok(index >= 0);
    if (variant === 'missing') groups.splice(index, 1);
    if (variant === 'partial') groups[index].pop();
    if (variant === 'chip') groups[index].push('history:6:2');
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false, variant);
    assert.equal(report.cases[3].review?.acceptance, 'pass');
    assert.equal(
      report.cases[3].reviews.find(
        (r) => r.storyId === fixture.cases[3].stories[2].id,
      )?.acceptance,
      'fail',
    );
  }
});

void test('Nov 17 World requires second-day Kerch continuity and rejects shared-war or shared-policy links', async () => {
  const index = fixture.cases.length - 1;
  const item = fixture.cases[index];
  assert.equal(item.topicName, 'World news & politics');
  assert.equal(item.reviews!.length, 4);
  assert.equal(
    item.reviews!.some((r) => r.storyId === item.stories[4].id),
    false,
  );
  for (const variant of ['missing', 'mine', 'strike', 'sanctions']) {
    const records = controls();
    if (variant === 'missing') records[index].groups = [];
    if (variant === 'mine')
      records[index].groups.push(['current:1', 'history:1:0']);
    if (variant === 'strike')
      records[index].groups.push(['current:2', 'history:0:3']);
    if (variant === 'sanctions')
      records[index].groups.push(['current:3', 'history:0:4']);
    const report = await evaluateDevelopingStories(fixture.cases, records);
    assert.equal(report.controlsPassed, false, variant);
    assert.ok(report.cases[index].reviews.some((r) => r.acceptance === 'fail'));
    assert.equal(report.semanticAcceptance, 'not-established');
  }
});

void test('Nov 18 World requires summit, bridge and sanctions continuity without merging separate Gaza operations', async () => {
  const { cases } = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/developing-stories-world-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as { cases: ReplayCase[] };
  const item = cases[0];
  const evidence = developingEvidence(item.stories, item.history);
  const recorded = [
    {
      editionId: item.editionId,
      topicId: item.topicId,
      inputSha256: replayFingerprint(item),
      groups: item
        .reviews!.filter((r) => r.expectedPredecessors.length)
        .map((r) => [
          evidence.find(
            (e) => e.editionId === null && e.story.id === r.storyId,
          )!.reference,
          ...r.expectedPredecessors.map(
            (p) =>
              evidence.find(
                (e) => e.editionId === p.editionId && e.story.id === p.storyId,
              )!.reference,
          ),
        ]),
    },
  ];
  const baseline = await evaluateDevelopingStories(cases, recorded);
  assert.equal(baseline.controlsPassed, true);
  assert.equal(baseline.cases[0].links.length, 3);
  const bridge = baseline.cases[0].links.find(
    (l) => l.storyId === item.stories[3].id,
  )!;
  assert.equal(bridge.editionCount, 3);
  assert.equal(bridge.previousStoryId, item.history[0].stories[0].id);
  assert.equal(
    item.reviews!.some((r) => r.storyId === item.stories[1].id),
    false,
  );
  for (const variant of [
    'summit',
    'bridge',
    'sanctions',
    'partial-bridge',
    'gaza',
    'sanctions-cause',
  ]) {
    const changed = structuredClone(recorded);
    if (variant === 'summit') changed[0].groups.splice(0, 1);
    if (variant === 'bridge') changed[0].groups.splice(1, 1);
    if (variant === 'sanctions') changed[0].groups.splice(2, 1);
    if (variant === 'partial-bridge') changed[0].groups[1].pop();
    if (variant === 'gaza')
      changed[0].groups.push(['current:2', 'history:2:4']);
    if (variant === 'sanctions-cause') changed[0].groups[2].push('history:1:4');
    const report = await evaluateDevelopingStories(cases, changed);
    assert.equal(report.controlsPassed, false, variant);
    assert.equal(report.semanticAcceptance, 'not-established');
  }
});
