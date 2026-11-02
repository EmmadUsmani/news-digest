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

void test('clause pairs keep identical evidence and cover all topics with explicit support judgments', () => {
  const report = evaluateSupport();
  assert.equal(report.clausePairs.length, 8);
  assert.deepEqual(
    [...new Set(report.clausePairs.map((pair) => pair.topic))].sort(),
    ['Gaming', 'NBA', 'Tech & AI', 'World'],
  );
  for (const pair of report.clausePairs) {
    const entries = report.cases.filter((entry) => entry.pair === pair.id);
    assert.equal(entries.length, 2);
    const supported = entries.find((entry) => entry.supported)!;
    const unsupported = entries.find((entry) => !entry.supported)!;
    assert.deepEqual(supported.evidence, unsupported.evidence);
    assert.notEqual(supported.claim, unsupported.claim);
    assert.ok(entries.every((entry) => entry.origin === 'synthetic'));
    assert.equal(pair.supportedAccepted, supported.accepted);
    assert.equal(pair.unsupportedRejected, !unsupported.accepted);
  }
  // Deliberately do not require today's guard failures to remain failures.
});
