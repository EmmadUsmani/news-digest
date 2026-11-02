import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateRecordedSupport } from '../scripts/evaluate-recorded-support';

void test('recorded support audit covers all selected fields with pinned claims and cited bounded inputs', () => {
  const report = evaluateRecordedSupport();
  assert.equal(report.counts.fields, 20);
  assert.equal(
    report.counts.supported +
      report.counts.interpretation +
      report.counts.unsupported,
    report.counts.fields,
  );
  assert.equal(
    new Set(report.cases.map((entry) => `${entry.storyId}:${entry.field}`))
      .size,
    20,
  );
  for (const entry of report.cases) {
    assert.ok(
      entry.claim.length && entry.reason.length && entry.evidence.length,
    );
    assert.ok(
      entry.evidence.every(
        (candidate) =>
          candidate.title.length <= 300 &&
          (candidate.excerpt?.length ?? 0) <= 600,
      ),
    );
  }
  assert.deepEqual(
    report.falseRejections,
    report.cases
      .filter((entry) => entry.label === 'supported' && !entry.accepted)
      .map((entry) => `${entry.storyId}:${entry.field}`),
  );
  assert.deepEqual(
    report.unsupportedAccepted,
    report.cases
      .filter((entry) => entry.label === 'unsupported' && entry.accepted)
      .map((entry) => `${entry.storyId}:${entry.field}`),
  );
  // Do not make the guard's current weaknesses mandatory behavior.
});
