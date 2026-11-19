import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { recordedTechEvidence } from '../../../scripts/lib/tech-admission-evidence';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type {
  StoryGroupingObservation,
  StoryGroupingResult,
} from '../src/modules/curation/public/editorial';
import { storyAdmission } from '../src/modules/digests/application/story-admission';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

const recorded = JSON.parse(
  readFileSync(
    new URL('./fixtures/tech-admission-2026-11-17.json', import.meta.url),
    'utf8',
  ),
) as {
  ranked: { id: string; coverage: { id: string }[] }[];
  scores: { id: string; importance: number; relevance: number }[];
  publishedEditorIds: string[];
};
const sources = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/tech-admission-evidence-2026-11-17.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { candidates: Candidate[]; windowStart: string; windowEnd: string };
const groups = recorded.ranked
  .filter((e) => e.coverage.length > 1)
  .map((e) => e.coverage.map((c) => c.id));
const input = {
  topicId: 'seeded-tech-topic-id',
  tech: true,
  shortlist: sources.candidates,
  scores: recorded.scores,
  start: new Date(sources.windowStart),
  end: new Date(sources.windowEnd),
  triage: 'complete' as const,
  runId: 'offline',
};

function grouping(
  result: StoryGroupingResult = { status: 'validated', groups },
) {
  const calls = { legacy: 0, prepared: 0 };
  return {
    calls,
    async group() {
      calls.legacy++;
      return groups;
    },
    async groupWithResult(
      topic: string,
      candidates: { id: string }[],
      run: string,
    ) {
      calls.prepared++;
      assert.equal(topic, input.topicId);
      assert.equal(run, input.runId);
      assert.deepEqual(
        candidates.map((c) => c.id),
        sources.candidates.map((c) => c.id),
      );
      return result;
    },
  };
}

void test('runtime admission defaults off and non-Tech retains the exact legacy grouping and shortlist', async () => {
  for (const flags of [
    {},
    { enabled: false },
    { enabled: true, tech: false },
  ]) {
    const port = grouping();
    const result = await storyAdmission({ ...input, grouping: port, ...flags });
    assert.deepEqual(port.calls, { legacy: 1, prepared: 0 });
    assert.deepEqual(
      result.ranked.map((e) => e.id),
      recorded.publishedEditorIds,
    );
    assert.deepEqual(
      result.ranked,
      rank(input.shortlist, input.start, input.end, 10, result.matches),
    );
    assert.equal(result.decision, undefined);
  }
});

void test('runtime Tech opt-in transports all recorded events to the same bounded reservation policy', async () => {
  const port = grouping();
  const result = await storyAdmission({
    ...input,
    grouping: port,
    enabled: true,
  });
  const control = recordedTechEvidence({
    ...recorded,
    ...sources,
    enabled: true,
    triage: 'complete',
  });
  assert.deepEqual(port.calls, { legacy: 0, prepared: 1 });
  assert.deepEqual(result.decision, control.decision);
  assert.deepEqual(result.ranked, control.decision.admitted);
  assert.equal(result.decision?.reserved.length, 2);
  assert.equal(result.decision?.displaced.length, 2);
  assert.equal(result.ranked.length, 10);
});

void test('unavailable or invalid grouping and unsuccessful triage never authorize runtime reservations', async () => {
  for (const output of [
    { status: 'unavailable', reason: 'no-result' } as const,
    {
      status: 'validated',
      groups: [['unknown', input.shortlist[0].id]],
    } as const,
  ]) {
    const port = grouping(output as StoryGroupingResult);
    const result = await storyAdmission({
      ...input,
      grouping: port,
      enabled: true,
    });
    assert.equal(result.decision?.reason, 'grouping-unavailable');
    assert.deepEqual(
      result.ranked,
      rank(input.shortlist, input.start, input.end, 10),
    );
    assert.deepEqual(port.calls, { legacy: 0, prepared: 1 });
  }
  for (const triage of ['failed', 'incomplete'] as const) {
    const port = grouping();
    const result = await storyAdmission({
      ...input,
      grouping: port,
      enabled: true,
      triage,
    });
    assert.equal(result.decision?.reason, `triage-${triage}`);
    assert.deepEqual(
      result.ranked.map((e) => e.id),
      recorded.publishedEditorIds,
    );
  }
});

void test('validated empty grouping differs from unavailable and never changes representatives', async () => {
  const port = grouping({ status: 'validated', groups: [] });
  const result = await storyAdmission({
    ...input,
    grouping: port,
    enabled: true,
  });
  assert.equal(result.decision?.status, 'evaluated');
  assert.ok(
    result.ranked.every(
      (e) => e.coverage.length === 1 && e.coverage[0].id === e.id,
    ),
  );
  const noService = await storyAdmission({
    ...input,
    grouping: null,
    enabled: true,
  });
  assert.equal(noService.decision?.reason, 'grouping-unavailable');
});

void test('both admission paths preserve actual grouping observations without changing calls or membership', async () => {
  for (const enabled of [false, true]) {
    let calls = 0;
    const service = new EventGrouping(
      {
        async json(_request, validate) {
          calls++;
          return validate({ groups });
        },
      },
      llmConfig({}).haiku,
    );
    const observations: StoryGroupingObservation[] = [];
    const result = await storyAdmission({
      ...input,
      enabled,
      grouping: service,
      observeGrouping: (value) => observations.push(value),
    });
    assert.equal(calls, 1);
    assert.deepEqual(observations, [
      {
        topicId: input.topicId,
        inputIds: input.shortlist.map((item) => item.id),
        result: { status: 'validated', groups },
      },
    ]);
    const expected = await storyAdmission({
      ...input,
      enabled,
      grouping: service,
    });
    assert.deepEqual(result.ranked, expected.ranked);
  }
});
