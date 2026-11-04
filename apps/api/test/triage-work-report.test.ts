import assert from 'node:assert/strict';
import { test } from 'node:test';

import { reportTriageWork } from '../../../scripts/report-triage-work';

const row = (articleId: string, fingerprint = 'v1', topicId = 'tech') => ({
  topicId,
  articleId,
  fingerprint,
});
const attempt = (
  articleId: string,
  attemptId = articleId,
  fingerprint = 'v1',
  outcome = 'scored',
) => ({
  ...row(articleId, fingerprint),
  attemptId,
  completedAt: '2026-11-04T10:00:00.000Z',
  outcome,
});
const evidence = () => ({
  windowStart: '2026-11-03T15:00:00.000Z',
  windowEnd: '2026-11-04T15:00:00.000Z',
  finalPoolObservedAt: '2026-11-04T15:00:00.000Z',
  finalPool: [row('a'), row('b', 'v2'), row('pending'), row('a', 'v1', 'nba')],
  attempts: [
    attempt('a'),
    attempt('a', 'retry'),
    attempt('b'),
    attempt('gone'),
    attempt('pending', 'failed', 'v1', 'unscored'),
  ],
});

void test('successful work join separates repeats, changed inputs, absent articles and failed attempts by topic', () => {
  const report = reportTriageWork(evidence());
  assert.equal(report.attempts, 5);
  assert.equal(report.successfulScorings, 4);
  assert.equal(report.unscoredAttempts, 1);
  assert.equal(report.reusableScorings, 2);
  assert.equal(report.reusableArticles, 1);
  assert.equal(report.repeatedReusableScorings, 1);
  assert.equal(report.absentFromFinalPool, 1);
  assert.equal(report.changedFingerprint, 1);
  assert.equal(report.unusableScorings, 2);
  assert.equal(report.finalPoolWithoutReusableScore, 3);
});

void test('rejects incomplete final observations, out-of-window scoring and duplicated evidence', () => {
  const data = evidence();
  assert.throws(
    () => reportTriageWork({ ...data, finalPoolObservedAt: data.windowStart }),
    /Final pool/,
  );
  assert.throws(
    () => reportTriageWork({ ...data, windowEnd: data.windowStart }),
    /valid window/,
  );
  for (const completedAt of [data.windowEnd, '2026-11-03T14:59:59.000Z'])
    assert.throws(
      () =>
        reportTriageWork({
          ...data,
          attempts: [{ ...data.attempts[0], completedAt }],
        }),
      /background window/,
    );
  assert.throws(
    () =>
      reportTriageWork({
        ...data,
        finalPool: [...data.finalPool, data.finalPool[0]],
      }),
    /Duplicate final/,
  );
  assert.throws(
    () =>
      reportTriageWork({
        ...data,
        attempts: [...data.attempts, data.attempts[0]],
      }),
    /Duplicate scoring/,
  );
  assert.throws(() => reportTriageWork({}));
});

void test('empty observed pools count all successful work as unusable without inventing spend', () => {
  const report = reportTriageWork({ ...evidence(), finalPool: [] });
  assert.equal(report.unusableScorings, 4);
  assert.equal(report.reusableArticles, 0);
  assert.equal(report.finalPoolWithoutReusableScore, 0);
  assert.equal('cost' in report, false);
});
