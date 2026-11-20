import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  prepareDevelopingRewriteRequests,
  type RewriteCaptureCase,
} from '../scripts/prepare-developing-rewrite-requests';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { developingRewriteRequest } from '../src/modules/curation/application/developing-rewrite-request';
import { rewriteSelectedDevelopingStories } from '../src/modules/digests/application/rewrite-selected-developing-stories';
import type { developingHistory } from '../src/modules/digests/domain/developing-history';
import {
  developingEvidence,
  developingLinks,
} from '../src/modules/digests/domain/developing-links';

const selected = {
  id: 'a',
  title: 'Launch',
  summary: 'Accepted summary',
  whyItMatters: 'Impact',
};
const evidence = {
  id: 'a',
  title: 'Current report',
  excerpt: 'Original reporting with Unicode 日本語',
  sources: ['Publisher'],
};
const link = {
  storyId: 'a',
  previousEditionId: '00000000-0000-4000-8000-000000000001',
  previousStoryId: '00000000-0000-4000-8000-000000000002',
  previousHeadline: 'Launch announced',
  previousSummary: 'Previously planned',
  editionCount: 2,
};
const item: RewriteCaptureCase = {
  editionId: 'edition',
  topicId: 'topic',
  topicName: 'Tech',
  runId: 'edition',
  selected: [selected],
  evidence: [evidence],
  links: [link],
};

void test('offline capture preserves exact orchestrated request and conservative reservation', async () => {
  const model = llmConfig({}).sonnet;
  const before = structuredClone(item);
  const report = await prepareDevelopingRewriteRequests([item], model);
  const expected = developingRewriteRequest({
    model,
    runId: item.runId,
    topicId: item.topicId,
    stories: [{ selected, evidence, earlierCoverage: link }],
  });
  assert.deepEqual(report.cases[0].request, expected);
  assert.deepEqual(item, before);
  const bound =
    Buffer.byteLength(expected.instructions + expected.prompt, 'utf8') + 2048;
  assert.equal(report.cases[0].inputBound, bound);
  assert.equal(
    report.totalReserveMicros,
    Math.ceil(
      bound * Math.max(model.input, model.cacheWrite, model.cacheRead) +
        expected.maxOutputTokens * model.output,
    ),
  );
  assert.equal(report.requestCount, 1);
  const changed = await prepareDevelopingRewriteRequests(
    [
      {
        ...item,
        evidence: [{ ...evidence, excerpt: 'Changed original evidence' }],
      },
    ],
    model,
  );
  assert.notEqual(changed.cases[0].inputSha256, report.cases[0].inputSha256);
});

void test('offline capture charges no request for absent matches, missing evidence or oversized input', async () => {
  const report = await prepareDevelopingRewriteRequests(
    [
      { ...item, links: [] },
      { ...item, evidence: [] },
      { ...item, evidence: [{ ...evidence, excerpt: 'x'.repeat(100000) }] },
    ],
    llmConfig({}).sonnet,
  );
  assert.equal(report.requestCount, 0);
  assert.equal(report.totalReserveMicros, 0);
  for (const result of report.cases) {
    assert.equal(result.status, 'unavailable');
    assert.equal(result.request, null);
    assert.equal(result.reserveMicros, null);
  }
});

void test('saved positive memberships capture original evidence without replacing the accepted selection', async () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/developing-stories-saved-2026-11-12-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as {
    cases: {
      editionId: string;
      topicId: string;
      topicName: string;
      stories: { id: string; title: string; summary: string | null }[];
      history: ReturnType<typeof developingHistory>;
      reviewedStoryId: string;
      expectedPredecessors: { editionId: string; storyId: string }[];
      selected?: RewriteCaptureCase['selected'];
      originalEditorialEvidence?: {
        promptSha256: string;
        evidence: RewriteCaptureCase['evidence'];
      };
    }[];
  };
  const cases: RewriteCaptureCase[] = [];
  for (const item of fixture.cases) {
    if (!item.originalEditorialEvidence || !item.selected) continue;
    const evidence = developingEvidence(item.stories, item.history);
    const current = evidence.find(
      (x) => x.editionId === null && x.story.id === item.reviewedStoryId,
    )!;
    const previous = item.expectedPredecessors.map((p) =>
      evidence.find(
        (x) => x.editionId === p.editionId && x.story.id === p.storyId,
      )!,
    );
    assert.ok(previous.every(Boolean));
    const links = developingLinks(item.stories, item.history, [
      [current.reference, ...previous.map((x) => x.reference)],
    ]);
    assert.equal(links.length, 1);
    assert.equal(links[0].editionCount, previous.length + 1);
    assert.equal(
      links[0].previousEditionId,
      item.expectedPredecessors[0].editionId,
    );
    assert.match(item.originalEditorialEvidence.promptSha256, /^[a-f0-9]{64}$/);
    cases.push({
      editionId: item.editionId,
      topicId: item.topicId,
      topicName: item.topicName,
      runId: item.editionId,
      selected: item.selected,
      evidence: item.originalEditorialEvidence.evidence,
      links,
    });
  }
  assert.equal(cases.length, 2);
  const before = structuredClone(cases);
  const model = llmConfig({}).sonnet;
  const report = await prepareDevelopingRewriteRequests(cases, model);
  assert.equal(report.requestCount, 2);
  for (const [index, item] of cases.entries()) {
    const link = item.links[0];
    assert.deepEqual(
      report.cases[index].request,
      developingRewriteRequest({
        model,
        runId: item.runId,
        topicId: item.topicId,
        stories: [
          {
            selected: item.selected.find((x) => x.id === link.storyId)!,
            evidence: item.evidence.find((x) => x.id === link.storyId)!,
            earlierCoverage: link,
          },
        ],
      }),
    );
    assert.ok(report.cases[index].reserveMicros! > 0);
    if (item.topicName === 'Gaming') {
      let calls = 0;
      const result = await rewriteSelectedDevelopingStories({
        ...item,
        model,
        llm: {
          async complete(request) {
            calls++;
            assert.match(
              request.instructions,
              /only repeats an earlier result/,
            );
            assert.match(
              request.instructions,
              /return null for the entire request/,
            );
            assert.match(
              request.instructions,
              /Never describe earlier conditional claims/,
            );
            assert.deepEqual(request, report.cases[index].request);
            // Scripted refusal, not a semantic model judgement.
            return {
              text: 'null',
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            };
          },
        },
      });
      assert.equal(calls, 1);
      assert.equal(result.status, 'unchanged');
      assert.equal(result.stories, item.selected);
      assert.equal(result.stories.length, 5);
      assert.ok(result.stories.every((story) => !('developing' in story)));
    }
  }
  assert.deepEqual(cases, before);
});

void test('rewrite capture rejects foreign execution attribution without changing input', async () => {
  for (const runId of ['', 'offline', 'other-edition']) {
    const input = { ...item, runId };
    const before = structuredClone(input);
    await assert.rejects(
      prepareDevelopingRewriteRequests([input], llmConfig({}).sonnet),
      /run differs/,
    );
    assert.deepEqual(input, before);
  }
});
