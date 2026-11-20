import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedTriageObligations } from '../../../scripts/lib/protected-triage-obligations';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { CandidateTriage } from '../src/modules/curation/application/triage';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

void test('offline triage bounds cover all batches and real repair dispatches', async () => {
  const model = {
    id: 'haiku',
    input: 1,
    output: 5,
    cacheRead: 0.1,
    cacheWrite: 1.25,
  };
  const topic = { id: 'topic', name: 'Tech', description: '', guidance: '' };
  const cache = {
    cached: () => Promise.resolve(undefined),
    cache: () => Promise.resolve(),
  };
  for (const kind of ['article', 'social'] as const) {
    for (const long of [false, true]) {
      const candidates = Array.from({ length: 200 }, (_, i) => ({
        id: `item-${i}`,
        title: 'Launch 日',
        excerpt: long ? '日'.repeat(1800) : 'Launch',
        sources: ['Publisher'],
        evidence: '日'.repeat(3000),
      }));
      const before = structuredClone(candidates);
      const bound = await protectedTriageObligations({
        model,
        kind,
        args: [topic, candidates, 'edition'],
      });
      assert.ok(bound.requests.length >= 8);
      const originals = bound.requests.filter((_, i) => i % 2 === 0);
      assert.deepEqual(
        originals
          .flatMap((r) =>
            (
              JSON.parse(r.prompt) as { candidates: { originalId: string }[] }
            ).candidates.map((c) => c.originalId),
          )
          .sort(),
        candidates.map((c) => c.id).sort(),
      );
      for (const invalid of ['not JSON', '{}', '{"items":[]}']) {
        const actual: LlmRequest[] = [];
        const attempts = new Map<string, number>();
        const llm = new BudgetedLlm(
          {
            complete: (request) => {
              actual.push(structuredClone(request));
              const wire = JSON.parse(
                request.prompt.split('\nReturn only valid JSON')[0],
              ) as { candidates: { id: string }[] };
              const key =
                wire.candidates.map((c) => c.id).join(',') +
                request.prompt.split('\nReturn only valid JSON')[0];
              const attempt = attempts.get(key) ?? 0;
              attempts.set(key, attempt + 1);
              return Promise.resolve({
                text:
                  attempt === 0
                    ? invalid
                    : JSON.stringify({
                        items: wire.candidates.map(({ id }) => ({
                          id,
                          relevance: 5,
                          importance: 5,
                          event: 'Launch',
                          rationale: 'Launch',
                        })),
                      }),
                usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
              });
            },
          },
          {
            ...cache,
            reserve: () => Promise.resolve('hold'),
            settle: () => Promise.resolve(),
            fail: () => Promise.resolve(),
          },
        );
        const result = await new CandidateTriage(llm, cache, model, kind).score(
          topic,
          candidates,
          'edition',
        );
        assert.equal(result.scores.length, 200);
        assert.deepEqual(result.unscoredIds, []);
        assert.equal(actual.length, bound.requests.length);
        for (const request of actual) {
          const base = request.prompt.split('\nReturn only valid JSON')[0];
          const i = originals.findIndex((r) => r.prompt === base);
          assert.ok(i >= 0);
          const supplied =
            bound.requests[2 * i + (request.prompt === base ? 0 : 1)];
          assert.deepEqual({ ...request, prompt: supplied.prompt }, supplied);
          assert.ok(
            Buffer.byteLength(request.prompt) <=
              Buffer.byteLength(supplied.prompt),
          );
        }
      }
      assert.deepEqual(candidates, before);
    }
    assert.deepEqual(
      (
        await protectedTriageObligations({
          model,
          kind,
          args: [topic, [], 'edition'],
        })
      ).requests,
      [],
    );
    const duplicate = { id: 'same', title: 'Same', excerpt: null, sources: [] };
    await assert.rejects(
      protectedTriageObligations({
        model,
        kind,
        args: [topic, [duplicate, duplicate], 'edition'],
      }),
      /unique candidates/,
    );
  }
});
