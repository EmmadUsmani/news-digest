import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateSupport } from '../scripts/evaluate-support';

void test('offline support audit accounts for labels and links actual recorded significance to bounded evidence', () => {
  const report = evaluateSupport();
  assert.equal(
    new Set(report.cases.map((c) => c.id)).size,
    report.cases.length,
  );
  assert.equal(report.supported + report.unsupported, report.cases.length);
  assert.deepEqual(
    report.falseRejections,
    report.cases.filter((c) => c.supported && !c.accepted).map((c) => c.id),
  );
  assert.deepEqual(
    report.unsupportedAccepted,
    report.cases.filter((c) => !c.supported && c.accepted).map((c) => c.id),
  );
  const recorded = report.cases.filter((c) => c.origin === 'recorded-tech-v4');
  assert.equal(recorded.length, 2);
  assert.ok(recorded.every((c) => c.evidence.length > 0 && c.claim.length > 0));
  assert.ok(report.cases.every((c) => c.reason.length > 0));
});
