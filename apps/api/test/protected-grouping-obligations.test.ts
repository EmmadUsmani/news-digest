import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedGroupingObligations } from '../../../scripts/lib/protected-grouping-obligations';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

const model = {
  id: 'haiku',
  input: 1,
  output: 5,
  cacheRead: 0.1,
  cacheWrite: 1.25,
};
const scopes = ['world', 'us'].map((id) => ({
  id,
  name: id,
  description: '',
  guidance: '',
}));
const candidates = Array.from({ length: 40 }, (_, i) => ({
  id: `article-${i}`,
  topicId: 'world',
  title: '日'.repeat(100),
  outlet: 'Outlet',
  publishedAt: '2026-11-20T04:00:00Z',
  excerpt: '日'.repeat(100),
  outboundLinks: ['https://example.com/report'],
}));

void test('grouping protection matches actual no-repair dispatches on both routes', async () => {
  for (const kind of ['topic', 'joint'] as const) {
    const input =
      kind === 'topic'
        ? {
            kind,
            model,
            args: ['world', candidates, 'edition'] as Parameters<
              EventGrouping['groupWithResult']
            >,
          }
        : {
            kind,
            model,
            args: [scopes, candidates, 'edition'] as Parameters<
              EventGrouping['assignTopics']
            >,
          };
    const before = structuredClone(input);
    const bound = await protectedGroupingObligations(input);
    assert.equal(bound.requests.length, 1);
    for (const text of ['invalid JSON', '{}']) {
      const actual: LlmRequest[] = [];
      const llm = new BudgetedLlm(
        {
          complete: (request) => {
            actual.push(structuredClone(request));
            return Promise.resolve({
              text,
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            });
          },
        },
        {
          reserve: () => Promise.resolve('hold'),
          cached: () => Promise.resolve(undefined),
          cache: () => Promise.resolve(),
          settle: () => Promise.resolve(),
          fail: () => Promise.resolve(),
        },
      );
      const grouping = new EventGrouping(llm, model);
      if (input.kind === 'topic') await grouping.groupWithResult(...input.args);
      else await grouping.assignTopics(...input.args);
      assert.deepEqual(actual, bound.requests);
    }
    assert.deepEqual(input, before);
  }
});

void test('grouping protection distinguishes no-call pools from invalid or oversized inputs', async () => {
  for (const pool of [[], candidates.slice(0, 1)]) {
    assert.deepEqual(
      (
        await protectedGroupingObligations({
          kind: 'topic',
          model,
          args: ['world', pool, 'edition'],
        })
      ).requests,
      [],
    );
  }
  assert.deepEqual(
    (
      await protectedGroupingObligations({
        kind: 'joint',
        model,
        args: [scopes, [], 'edition'],
      })
    ).requests,
    [],
  );
  for (const pool of [
    [candidates[0], candidates[0]],
    [...candidates, candidates[0]],
    candidates.map((c) => ({ ...c, topicId: 'foreign' })),
  ]) {
    await assert.rejects(
      protectedGroupingObligations({
        kind: 'topic',
        model,
        args: ['world', pool, 'edition'],
      }),
    );
    await assert.rejects(
      protectedGroupingObligations({
        kind: 'joint',
        model,
        args: [scopes, pool, 'edition'],
      }),
    );
  }
  await assert.rejects(
    protectedGroupingObligations({
      kind: 'joint',
      model,
      args: [scopes.slice(0, 1), candidates, 'edition'],
    }),
  );
  const large = candidates.map((c, n) => ({
    ...c,
    outboundLinks: Array.from(
      { length: 10 },
      (_, i) =>
        `https://example.com/${Math.floor(n / 2)}/${i}/${'x'.repeat(1900)}`,
    ),
  }));
  await assert.rejects(
    protectedGroupingObligations({
      kind: 'topic',
      model,
      args: ['world', large, 'edition'],
    }),
  );
  await assert.rejects(
    protectedGroupingObligations({
      kind: 'joint',
      model,
      args: [scopes, large, 'edition'],
    }),
  );
});
