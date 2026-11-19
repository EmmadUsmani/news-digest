import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  prepareDevelopingRewriteRequests,
  type RewriteCaptureCase,
} from '../scripts/prepare-developing-rewrite-requests';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { developingRewriteRequest } from '../src/modules/curation/application/developing-rewrite-request';

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
  runId: 'offline',
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
