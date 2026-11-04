import assert from 'node:assert/strict';
import { test } from 'node:test';

import { triageFingerprints } from '../../../scripts/compare-triage-cache';
import { reportCapturedTriageWork } from '../../../scripts/report-captured-triage-work';

const capture = () => ({
  capturedAt: '2026-11-04T15:00:00.000Z',
  windowStart: '2026-11-03T15:00:00.000Z',
  windowEnd: '2026-11-04T15:00:00.000Z',
  pools: [
    {
      topic: {
        id: 'tech',
        name: 'Tech',
        description: '',
        include_guidance: '',
        exclude_guidance: '',
        relevance_policy: { includeAny: [], excludeAny: [] },
      },
      candidates: ['retained', 'updated', 'excluded', 'pending'].map((id) => ({
        id,
        title: id,
        excerpt: null,
        sources: ['News'],
        triageEligible: true,
      })),
    },
  ],
});

void test('joins exported writes to final production keys, preserving repeat and loss evidence', async () => {
  const before = capture();
  const keys = (await triageFingerprints(before, 'fixture-model')).get('tech')!;
  const attempts = [...keys]
    .filter(([id]) => id !== 'pending')
    .map(([articleId, fingerprint]) => ({
      topicId: 'tech',
      articleId,
      fingerprint,
      attemptId: 'first',
      completedAt: '2026-11-04T10:00:00.000Z',
      outcome: 'scored',
    }));
  const after = capture();
  after.pools[0].candidates[1].title = 'Updated reporting';
  after.pools[0].candidates[2].triageEligible = false;
  const report = await reportCapturedTriageWork(after, 'fixture-model', [
    { attempts },
    { attempts: [{ ...attempts[0], attemptId: 'second' }] },
  ]);
  assert.equal(report.successfulScorings, 4);
  assert.equal(report.reusableArticles, 1);
  assert.equal(report.repeatedReusableScorings, 1);
  assert.equal(report.changedFingerprint, 1);
  assert.equal(report.absentFromFinalPool, 1);
  assert.equal(report.finalPoolWithoutReusableScore, 2);
  assert.equal(report.model, 'fixture-model');
  await assert.rejects(
    reportCapturedTriageWork(after, 'fixture-model', [
      { attempts },
      { attempts },
    ]),
    /Duplicate scoring/,
  );
});

void test('rejects prospective captures, ambiguous identities and malformed exports', async () => {
  const data = capture();
  await assert.rejects(
    reportCapturedTriageWork(
      { ...data, capturedAt: data.windowStart },
      'fixture-model',
      [],
    ),
    /Final pool/,
  );
  await assert.rejects(reportCapturedTriageWork(data, '', []), /explicit/);
  await assert.rejects(reportCapturedTriageWork(data, 'fixture-model', [{}]));
  await assert.rejects(
    reportCapturedTriageWork(
      { ...data, pools: [...data.pools, ...data.pools] },
      'fixture-model',
      [],
    ),
    /Duplicate capture topic/,
  );
  data.pools[0].candidates.push(data.pools[0].candidates[0]);
  await assert.rejects(
    reportCapturedTriageWork(data, 'fixture-model', []),
    /Duplicate capture article/,
  );
});
