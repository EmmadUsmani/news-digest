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
      groups: item.expectedPredecessors!.length
        ? [
            [
              evidence.find(
                (x) =>
                  x.editionId === null && x.story.id === item.reviewedStoryId,
              )!.reference,
              ...item.expectedPredecessors!.map(
                (p) =>
                  evidence.find(
                    (x) =>
                      x.editionId === p.editionId && x.story.id === p.storyId,
                  )!.reference,
              ),
            ],
          ]
        : [],
    };
  });
}

void test('manual positive and negative controls pass offline replay; all linked pairs are exposed', async () => {
  const report = await evaluateDevelopingStories(fixture.cases, controls());
  assert.equal(report.controlsPassed, true);
  assert.equal(
    report.cases.reduce((n, c) => n + c.links.length, 0),
    5,
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
