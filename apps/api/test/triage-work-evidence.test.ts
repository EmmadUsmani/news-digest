import assert from 'node:assert/strict';
import { test } from 'node:test';

import { reportTriageWork } from '../../../scripts/report-triage-work';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import { triageWorkEvidence } from '../src/modules/curation/application/triage-work-evidence';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

void test('actual item writes produce report-compatible evidence while warm cache hits do not', async () => {
  const values = new Map<string, unknown>();
  const ledger: LlmLedger = {
    cached: (key) => Promise.resolve(values.get(key)),
    cache: (key, value) => {
      values.set(key, value);
      return Promise.resolve();
    },
    reserve: () => Promise.resolve('hold'),
    settle: () => Promise.resolve(),
    fail: () => Promise.resolve(),
  };
  let calls = 0;
  const llm = new BudgetedLlm(
    {
      complete: (request) => {
        calls++;
        const input = JSON.parse(request.prompt) as {
          candidates: { id: string }[];
        };
        return Promise.resolve({
          text: JSON.stringify({
            items: input.candidates.map(({ id }) => ({
              id,
              relevance: 8,
              importance: 7,
              event: 'Launch',
              rationale: 'Relevant launch',
            })),
          }),
          usage: { input: 20, output: 20, cacheRead: 0, cacheWrite: 0 },
        });
      },
    },
    ledger,
  );
  const topic = { id: 'topic', name: 'Tech', description: '', guidance: '' };
  const candidate = {
    id: 'article',
    title: 'Launch',
    excerpt: null,
    sources: [],
  };
  const observe = (attemptId: string) =>
    triageWorkEvidence(ledger, { topicId: topic.id, attemptId }, () =>
      Date.parse('2026-11-04T01:00:00Z'),
    );
  const cold = observe('cold');
  const scorer = (evidence: ReturnType<typeof observe>) =>
    new CandidateTriage(llm, evidence.cache, llmConfig({}).haiku);
  await scorer(cold).score(topic, [candidate], 'cold');
  assert.equal(cold.attempts().length, 1);
  assert.equal(cold.attempts()[0].articleId, candidate.id);
  const warm = observe('warm');
  assert.equal(
    (await scorer(warm).score(topic, [candidate], 'warm')).scores.length,
    1,
  );
  assert.equal(calls, 1);
  assert.deepEqual(warm.attempts(), []);
  const changed = observe('changed');
  await scorer(changed).score(
    topic,
    [{ ...candidate, title: 'Updated launch' }],
    'changed',
  );
  assert.notEqual(
    cold.attempts()[0].fingerprint,
    changed.attempts()[0].fingerprint,
  );
  const report = reportTriageWork({
    windowStart: '2026-11-04T00:00:00Z',
    windowEnd: '2026-11-04T02:00:00Z',
    finalPoolObservedAt: '2026-11-04T02:00:00Z',
    finalPool: changed.attempts(),
    attempts: [...cold.attempts(), ...warm.attempts(), ...changed.attempts()],
  });
  assert.equal(report.attempts, 2);
  assert.equal(report.successfulScorings, 2);
  assert.equal(report.changedFingerprint, 1);
  assert.equal(report.reusableArticles, 1);
});

void test('evidence excludes failed writes and other cache kinds and preserves partial successes', async () => {
  const evidence = triageWorkEvidence(
    {
      cached: () => Promise.resolve(null),
      cache: (_key, value) =>
        (value as { id?: string })?.id === 'fail'
          ? Promise.reject(new Error('storage failed'))
          : Promise.resolve(),
    },
    { topicId: 'topic', attemptId: 'partial' },
    () => 0,
  );
  const key = 'triage-item-v1:' + 'a'.repeat(64);
  await assert.rejects(evidence.cache.cache(key, { id: 'fail' }));
  assert.deepEqual(evidence.attempts(), []);
  await evidence.cache.cache('request-cache', {});
  await evidence.cache.cache('social-triage-item-v1:' + 'b'.repeat(64), {
    id: 'social',
  });
  await evidence.cache.cache(key, { id: 'article' });
  await assert.rejects(
    evidence.cache.cache('triage-item-v1:' + 'c'.repeat(64), { id: 'article' }),
    /Duplicate/,
  );
  const snapshot = evidence.attempts();
  snapshot[0].articleId = 'mutated';
  assert.equal(evidence.attempts()[0].articleId, 'article');
  assert.equal(evidence.attempts().length, 1);
});
