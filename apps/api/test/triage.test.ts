import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { incrementalTriagePass } from '../src/modules/curation/application/incremental-triage-pass';
import {
  CandidateTriage,
  type TriageCandidate,
} from '../src/modules/curation/application/triage';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import type { BlueskyPost } from '../src/modules/social/domain/bluesky';
import { shortlistBlueskyPosts } from '../src/modules/social/public/bluesky-shortlist';
import { socialTriageCandidate } from '../src/modules/social/public/editorial-selection';

const topic = {
  id: 'tech',
  name: 'Tech',
  description: 'AI and software',
  guidance: 'Prioritize consequential launches',
};
const candidates: TriageCandidate[] = Array.from({ length: 7 }, (_, i) => ({
  id: String(i),
  title: 'Candidate ' + i,
  excerpt: 'Reported facts',
  sources: ['Publisher'],
}));
function harness(
  transform?: (items: ReturnType<typeof score>[]) => unknown,
  kind: 'article' | 'social' = 'article',
) {
  const values = new Map<string, unknown>();
  const calls: LlmRequest[] = [];
  let available = true;
  const ledger: LlmLedger = {
    async cached(key) {
      return values.get(key);
    },
    async cache(key, value) {
      values.set(key, value);
    },
    async reserve() {
      return available ? 'reservation' : null;
    },
    async settle() {},
    async fail() {},
  };
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls.push(request);
        const prompt = JSON.parse(request.prompt.split('\nReturn only')[0]) as {
          candidates: TriageCandidate[];
        };
        const items = prompt.candidates.map(score);
        return {
          text: JSON.stringify(transform ? transform(items) : { items }),
          usage: { input: 20, output: 20, cacheRead: 0, cacheWrite: 0 },
        };
      },
    },
    ledger,
  );
  return {
    service: new CandidateTriage(llm, ledger, llmConfig({}).haiku, kind),
    calls,
    values,
    ledger,
    refuse: () => {
      available = false;
    },
  };
}
function score(c: TriageCandidate) {
  return {
    id: c.id,
    relevance: 8,
    importance: 7,
    event: 'Model launch',
    rationale: 'Relevant reported launch',
  };
}
void test('triage covers all candidates in bounded batches before any lexical filter', async () => {
  const h = harness();
  const result = await h.service.score(topic, candidates, 'run');
  assert.deepEqual(
    result.scores.map((s) => s.id),
    candidates.map((c) => c.id),
  );
  assert.deepEqual(result.unscoredIds, []);
  assert.equal(h.calls.length, 1);
  assert.ok(
    h.calls.every(
      (r) =>
        r.model.id === 'claude-haiku-5-5' &&
        r.purpose === 'candidate-triage-v1',
    ),
  );
  await h.service.score(topic, candidates.slice().reverse(), 'new-run');
  assert.equal(
    h.calls.length,
    1,
    'Per-item cache survives different ordering and batch composition',
  );
});
void test('cache invalidates changed item text and topic guidance', async () => {
  const h = harness();
  await h.service.score(topic, candidates, 'first');
  await h.service.score(
    topic,
    [{ ...candidates[0], excerpt: 'Updated facts' }],
    'changed',
  );
  assert.equal(h.calls.length, 2);
  await h.service.score(
    { ...topic, guidance: 'New guidance' },
    [candidates[1]],
    'guidance',
  );
  assert.equal(h.calls.length, 3);
});
void test('duplicate, foreign, omitted and out-of-range outputs never become item cache entries', async () => {
  for (const transform of [
    (items: ReturnType<typeof score>[]) => ({
      items: items.map(() => items[0]),
    }),
    (items: ReturnType<typeof score>[]) => ({
      items: items.map((s) => ({ ...s, id: 'foreign' })),
    }),
    (items: ReturnType<typeof score>[]) => ({ items: items.slice(1) }),
    (items: ReturnType<typeof score>[]) => ({
      items: items.map((s) => ({ ...s, relevance: 11 })),
    }),
  ]) {
    const h = harness(transform);
    const result = await h.service.score(topic, candidates, 'invalid');
    assert.deepEqual(result.scores, []);
    assert.deepEqual(
      result.unscoredIds,
      candidates.map((c) => c.id),
    );
    assert.equal(
      h.calls.length,
      2,
      'Exactly one transport repair; stop before later batches',
    );
    assert.equal(h.values.size, 0);
  }
});
void test('budget exhaustion preserves cached items and explicitly reports remaining IDs', async () => {
  const h = harness();
  await h.service.score(topic, candidates.slice(0, 2), 'cached');
  h.refuse();
  const result = await h.service.score(topic, candidates, 'exhausted');
  assert.deepEqual(result.failures, ['budget-refused']);
  assert.equal(result.scores.length, 2);
  assert.deepEqual(
    result.unscoredIds,
    candidates.slice(2).map((c) => c.id),
  );
  assert.equal(h.calls.length, 1);
});
void test('worst-case escaped text stays below prompt limit; empty and invalid sets do not call', async () => {
  const h = harness();
  await h.service.score(
    {
      ...topic,
      name: '\u0000'.repeat(500),
      description: '\u0000'.repeat(5000),
      guidance: '\u0000'.repeat(5000),
    },
    candidates.slice(0, 3).map((c) => ({
      ...c,
      title: '\u0000'.repeat(600),
      excerpt: '\u0000'.repeat(5000),
      sources: Array(20).fill('\u0000'.repeat(500)) as string[],
    })),
    'bound',
  );
  assert.ok(
    Buffer.byteLength(h.calls[0].instructions + h.calls[0].prompt) + 2048 <
      100000,
  );
  assert.deepEqual(await h.service.score(topic, [], 'empty'), {
    scores: [],
    unscoredIds: [],
  });
  await assert.rejects(() =>
    h.service.score(topic, [candidates[0], candidates[0]], 'duplicate'),
  );
  await assert.rejects(() =>
    h.service.score(
      topic,
      Array(201).fill(candidates[0]) as TriageCandidate[],
      'oversize',
    ),
  );
  assert.equal(h.calls.length, 3, 'Escaped text splits at the byte ceiling');
});

void test('new triage requests and their single repair carry explicit field constraints', async () => {
  const h = harness((items) => ({
    items: items.map((item) => ({ ...item, rationale: 'x'.repeat(301) })),
  }));
  const result = await h.service.score(
    topic,
    candidates.slice(0, 1),
    'long-rationale',
  );
  assert.deepEqual(result.unscoredIds, ['0']);
  assert.equal(h.calls.length, 2);
  for (const call of h.calls) {
    const body = JSON.parse(call.prompt.split('\nReturn only')[0]) as {
      outputLimits: Record<string, string>;
    };
    assert.equal(
      body.outputLimits.rationale,
      '1–100 characters; one short factual phrase',
    );
    assert.equal(body.outputLimits.event, '1–80 characters; short event label');
  }
  assert.equal(h.values.size, 0, 'Overlong output still fails closed');
});

void test('social triage uses topic meaning and interestingness with separate caches and purpose', async () => {
  const h = harness(undefined, 'social');
  const world = {
    ...topic,
    id: 'world',
    name: 'World',
    description: 'Global news and politics',
    guidance: 'On-the-ground world events',
  };
  const posts = [
    {
      id: 'post',
      title: 'Verified X post',
      excerpt: 'Eyewitness footage from the election protests',
      sources: [],
    },
  ];
  const result = await h.service.score(world, posts, 'social');
  assert.equal(result.scores.length, 1);
  assert.equal(h.calls[0].purpose, 'social-triage-v1');
  assert.match(h.calls[0].instructions, /Importance means interestingness/);
  assert.match(h.calls[0].instructions, /never infer virality/);
  assert.match(h.calls[0].instructions, /no positive keyword rules/);
  assert.ok(
    [...h.values.keys()].some((key) =>
      key.startsWith('social-triage-item-v1:'),
    ),
  );
  assert.ok(
    [...h.values.keys()].every((key) => !key.startsWith('triage-item-v1:')),
  );
  await h.service.score(world, posts, 'cached');
  assert.equal(h.calls.length, 1);
  await h.service.score(
    { ...world, guidance: 'Different selection guidance' },
    posts,
    'changed',
  );
  assert.equal(h.calls.length, 2);
  const invalid = harness(
    (items) => ({ items: items.map((item) => ({ ...item, id: 'invented' })) }),
    'social',
  );
  assert.deepEqual(
    (await invalid.service.score(world, posts, 'invalid')).unscoredIds,
    ['post'],
  );
  assert.equal(invalid.calls.length, 2);
  assert.equal(invalid.values.size, 0);
  h.refuse();
  assert.deepEqual(
    (await h.service.score(world, [{ ...posts[0], id: 'new' }], 'refused'))
      .unscoredIds,
    ['new'],
  );
});

void test('article and social batches overlap up to four calls and preserve ordered results', async () => {
  for (const kind of ['article', 'social'] as const) {
    const values = new Map<string, unknown>();
    const requests: LlmRequest[] = [];
    let active = 0;
    let peak = 0;
    const releases: (() => void)[] = [];
    const service = new CandidateTriage(
      {
        async json(request, validate) {
          requests.push(request);
          active++;
          peak = Math.max(peak, active);
          await new Promise<void>((resolve) => releases.push(resolve));
          active--;
          const body = JSON.parse(request.prompt.split('\nReturn only')[0]) as {
            candidates: TriageCandidate[];
          };
          return validate({ items: body.candidates.map(score).reverse() });
        },
      },
      {
        async cached(key) {
          return values.get(key);
        },
        async cache(key, value) {
          values.set(key, value);
        },
      },
      llmConfig({}).haiku,
      kind,
    );
    const pool = Array.from({ length: 200 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    }));
    const pending = service.score(topic, pool, 'parallel');
    // Let cache reads and all four requests reach the explicit barrier.
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(active, 4);
    assert.equal(requests.length, 4);
    for (const request of requests) {
      assert.equal(JSON.parse(request.prompt).candidates.length, 50);
      assert.ok(request.maxOutputTokens >= 8000);
      assert.ok(request.maxOutputTokens < 10000);
    }
    releases.reverse().forEach((release) => release());
    const result = await pending;
    assert.equal(peak, 4);
    assert.deepEqual(
      result.scores.map((item) => item.id),
      pool.map((c) => c.id),
    );
    assert.deepEqual(result.unscoredIds, []);
    await service.score(topic, pool.slice().reverse(), 'cached');
    assert.equal(requests.length, 4);
    const changed = service.score(
      topic,
      [{ ...pool[0], title: 'Changed' }],
      'new',
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(requests.length, 5);
    assert.equal(JSON.parse(requests[4].prompt).candidates.length, 1);
    releases.at(-1)!();
    await changed;
  }
});

void test('escaped large batches obey byte ceiling and stop scheduling after refusal', async () => {
  let calls = 0;
  let active = 0;
  let peak = 0;
  const service = new CandidateTriage(
    {
      async json(request) {
        calls++;
        active++;
        peak = Math.max(peak, active);
        assert.ok(
          Buffer.byteLength(request.instructions + request.prompt) + 2048 <=
            60000,
        );
        assert.ok(JSON.parse(request.prompt).candidates.length < 50);
        await new Promise<void>((resolve) => setImmediate(resolve));
        active--;
        return null;
      },
    },
    {
      async cached() {
        return undefined;
      },
      async cache() {
        assert.fail('Refusal must not cache');
      },
    },
    llmConfig({}).haiku,
  );
  const pool = Array.from({ length: 200 }, (_, i) => ({
    id: String(i),
    title: '\u0000'.repeat(500),
    excerpt: '\u0000'.repeat(1800),
    sources: Array<string>(8).fill('\u0000'.repeat(120)),
  }));
  const result = await service.score(topic, pool, 'refused');
  assert.equal(calls, 4, 'Only the initial four batches are in flight');
  assert.equal(peak, 4);
  assert.deepEqual(result.scores, []);
  assert.deepEqual(
    result.unscoredIds,
    pool.map((c) => c.id),
  );
});

void test('compact triage bounds output reservations while preserving full candidate coverage', async () => {
  for (const kind of ['article', 'social'] as const) {
    const h = harness(undefined, kind);
    const batch = Array.from({ length: 50 }, (_, i) => ({
      ...candidates[0],
      id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
    }));
    const result = await h.service.score(topic, batch, 'compact');
    assert.equal(h.calls.length, 1);
    assert.deepEqual(
      result.scores.map((s) => s.id),
      batch.map((c) => c.id),
    );
    assert.deepEqual(result.unscoredIds, []);
    assert.equal(h.calls[0].maxOutputTokens, 8254);
    assert.match(h.calls[0].prompt, /Compact JSON only/);
    await h.service.score(topic, batch.slice().reverse(), 'replay');
    assert.equal(h.calls.length, 1, 'All validated scores remain reusable');
  }
});

void test('long escaped IDs use compact wire aliases without changing cached identity', async () => {
  const h = harness();
  const batch = Array.from({ length: 50 }, (_, i) => ({
    ...candidates[0],
    id: '\u0000'.repeat(190) + String(i),
  }));
  const result = await h.service.score(topic, batch, 'escaped-ids');
  assert.ok(h.calls[0].maxOutputTokens < 8500);
  const wire = h.calls.flatMap((call) => {
    const entries = JSON.parse(call.prompt).candidates;
    assert.deepEqual(
      entries.map((c: { id: string }) => c.id),
      entries.map((_: unknown, i: number) => String(i)),
    );
    return entries;
  });
  assert.deepEqual(
    wire.map((c: { originalId: string }) => c.originalId),
    batch.map((c) => c.id),
  );
  assert.deepEqual(
    result.scores.map((s) => s.id),
    batch.map((c) => c.id),
  );
  assert.deepEqual(result.unscoredIds, []);
});

void test('bounded background passes probe the item cache, carry backlog and retry refused items', async () => {
  const h = harness();
  const pool = Array.from({ length: 450 }, (_, i) => ({
    ...candidates[0],
    id: String(i),
  }));
  const options = { minimumPending: 25, maximumItems: 25 };
  const first = await incrementalTriagePass(
    h.service,
    topic,
    pool,
    'background',
    options,
  );
  assert.equal(first.pendingItems, 450);
  assert.equal(first.scoredIds.length, 25);
  assert.equal(first.deferredItems, 425);
  const second = await incrementalTriagePass(
    h.service,
    topic,
    pool,
    'background',
    options,
  );
  assert.equal(second.pendingItems, 425);
  assert.equal(second.scoredIds.length, 25);
  assert.equal(
    second.attemptedIds.some((id) => first.attemptedIds.includes(id)),
    false,
  );
  assert.equal(h.calls.length, 2);
  const small = pool.slice(50, 60);
  const waiting = await incrementalTriagePass(
    h.service,
    topic,
    small,
    'background',
    options,
  );
  assert.equal(waiting.deferredItems, 10);
  assert.deepEqual(waiting.attemptedIds, []);
  assert.equal(h.calls.length, 2);
  h.refuse();
  const refused = await incrementalTriagePass(
    h.service,
    topic,
    pool,
    'background',
    options,
  );
  assert.equal(refused.unscoredIds.length, 25);
  const retry = await incrementalTriagePass(
    h.service,
    topic,
    pool,
    'background',
    options,
  );
  assert.deepEqual(retry.attemptedIds, refused.attemptedIds);
  assert.equal(retry.pendingItems, 400);
});

void test('pending cache probe matches scoring fingerprints and rejects corrupt identities without spending', async () => {
  const h = harness();
  await h.service.score(topic, candidates, 'edition');
  assert.deepEqual(await h.service.pending(topic, candidates), []);
  assert.equal(
    (await h.service.cachedScores(topic, candidates)).length,
    candidates.length,
  );
  assert.deepEqual(
    await h.service.cachedScores(
      { ...topic, guidance: 'Changed guidance' },
      candidates,
    ),
    [],
  );
  assert.equal(
    (
      await h.service.pending(
        { ...topic, guidance: 'Changed guidance' },
        candidates,
      )
    ).length,
    candidates.length,
  );
  const changed = candidates.map((c, i) =>
    i === 0 ? { ...c, title: 'Updated title' } : c,
  );
  assert.deepEqual(
    (await h.service.pending(topic, changed)).map((c) => c.id),
    ['0'],
  );
  const [key, value] = [...h.values].find(([key]) =>
    key.startsWith('triage-item-v1:'),
  )!;
  h.values.set(key, { ...(value as object), id: 'wrong' });
  assert.equal((await h.service.pending(topic, candidates)).length, 1);
  assert.equal(
    (await h.service.cachedScores(topic, candidates)).length,
    candidates.length - 1,
  );
  h.values.set(key, { id: '0', relevance: 99 });
  assert.equal((await h.service.pending(topic, candidates)).length, 1);
  assert.equal(h.calls.length, 1);
});

void test('background pass rejects invalid bounds and duplicate pools before cache or provider access', async () => {
  const h = harness();
  for (const options of [
    { minimumPending: 0, maximumItems: 25 },
    { minimumPending: 25, maximumItems: 24 },
    { minimumPending: 1, maximumItems: 201 },
    { minimumPending: 1, maximumItems: 1.5 },
  ])
    await assert.rejects(
      incrementalTriagePass(
        h.service,
        topic,
        candidates,
        'background',
        options,
      ),
      /Expected/,
    );
  await assert.rejects(
    incrementalTriagePass(
      h.service,
      topic,
      [candidates[0], candidates[0]],
      'background',
      { minimumPending: 1, maximumItems: 25 },
    ),
    /unique/,
  );
  assert.equal(h.calls.length, 0);
  assert.equal(h.values.size, 0);
});

void test('edition scoring flushes a below-minimum tail and reuses background scores', async () => {
  const h = harness();
  const pool = Array.from({ length: 60 }, (_, i) => ({
    ...candidates[0],
    id: String(i),
  }));
  const options = { minimumPending: 25, maximumItems: 25 };
  await incrementalTriagePass(h.service, topic, pool, 'background', options);
  await incrementalTriagePass(h.service, topic, pool, 'background', options);
  const tail = await incrementalTriagePass(
    h.service,
    topic,
    pool,
    'background',
    options,
  );
  assert.equal(tail.pendingItems, 10);
  assert.equal(tail.attemptedIds.length, 0);
  const edition = await h.service.score(topic, pool, 'edition');
  assert.equal(edition.scores.length, 60);
  assert.deepEqual(edition.unscoredIds, []);
  assert.deepEqual(
    h.calls.map(
      (call) =>
        (JSON.parse(call.prompt) as { candidates: unknown[] }).candidates
          .length,
    ),
    [25, 25, 10],
  );
});

void test('batch admission stops new work after cache reads and preserves completed batches', async () => {
  const pool = Array.from({ length: 200 }, (_, i) => ({
    ...candidates[0],
    id: String(i),
  }));
  const h = harness();
  // Model a cutoff crossed during the scorer's own asynchronous cache scan.
  const blocked = await h.service.score(topic, pool, 'cutoff', () => false);
  assert.equal(h.calls.length, 0);
  assert.deepEqual(
    blocked.unscoredIds,
    pool.map((c) => c.id),
  );
  let admissions = 0;
  const partial = await h.service.score(
    topic,
    pool,
    'partial',
    () => ++admissions === 1,
  );
  assert.equal(h.calls.length, 1);
  assert.equal(partial.scores.length, 50);
  assert.deepEqual(
    partial.unscoredIds,
    pool.slice(50).map((c) => c.id),
  );
  // An in-flight successful batch was cached; the next pass pays only for
  // untouched candidates and retains original candidate order.
  const completed = await h.service.score(topic, pool, 'next');
  assert.equal(h.calls.length, 4);
  assert.deepEqual(
    completed.scores.map((s) => s.id),
    pool.map((c) => c.id),
  );
  assert.deepEqual(completed.unscoredIds, []);
});

for (const failureCount of [1, 2])
  void test(`triage drains siblings before returning ${failureCount} thrown batch failures`, async () => {
    const pool = Array.from({ length: 200 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
      excerpt: '\u0000'.repeat(1800),
    }));
    const values = new Map<string, unknown>();
    const releases: (() => void)[] = [];
    const failure = new Error('cache or provider failed');
    let calls = 0;
    const service = new CandidateTriage(
      {
        async json(request, validate) {
          const index = calls++;
          await new Promise<void>((resolve) => releases.push(resolve));
          if (index < failureCount) throw failure;
          return validate({
            items: JSON.parse(request.prompt).candidates.map(score),
          });
        },
      },
      {
        async cached(key) {
          return values.get(key);
        },
        async cache(key, value) {
          values.set(key, value);
        },
      },
      llmConfig({}).haiku,
    );
    let settled = false;
    const running = service.score(topic, pool, 'failure');
    const rejected = assert.rejects(running, (error) =>
      failureCount === 1
        ? error === failure
        : error instanceof AggregateError &&
          error.errors.length === failureCount &&
          error.errors.every((item) => item === failure),
    );
    void running.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(calls, 4);
    releases[0]();
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(
      settled,
      false,
      'Caller must retain admission while siblings run',
    );
    releases.slice(1).forEach((release) => release());
    await rejected;
    assert.equal(
      calls,
      4,
      'Failure stops batches queued beyond the initial four',
    );
    assert.ok(
      values.size > 0,
      'Successful siblings finish their item cache writes',
    );
    assert.ok(values.size < pool.length);
  });

void test('throwing batch admission stops sibling workers before more provider calls', async () => {
  for (const allowed of [0, 1]) {
    const h = harness();
    const pool = Array.from({ length: 200 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    }));
    const failure = new Error('schedule lookup failed');
    let admissions = 0;
    await assert.rejects(
      h.service.score(topic, pool, 'guard-failure', () => {
        if (admissions++ === allowed) throw failure;
        return true;
      }),
      (error) => error === failure,
    );
    assert.equal(admissions, allowed + 1);
    assert.equal(h.calls.length, allowed);
    assert.equal(
      [...h.values.keys()].filter((key) => key.startsWith('triage-item-v1:'))
        .length,
      allowed * 50,
    );
    const recovered = await h.service.score(topic, pool, 'recovered');
    assert.equal(recovered.scores.length, pool.length);
    assert.equal(h.calls.length, 4);
  }
});

void test('bulk cache reads preserve exact validation, identity and misses for scoring and probes', async () => {
  for (const kind of ['article', 'social'] as const) {
    const h = harness(undefined, kind);
    await h.service.score(topic, candidates, 'seed');
    const keys = [...h.values.keys()].filter((key) =>
      key.startsWith(
        kind === 'social' ? 'social-triage-item-v1:' : 'triage-item-v1:',
      ),
    );
    assert.equal(keys.length, candidates.length);
    // Same schema but wrong identity, malformed data, and an absent row must
    // all remain pending; database row order must not determine identity.
    h.values.set(keys[0], { ...score(candidates[0]), id: 'foreign' });
    h.values.set(keys[1], { broken: true });
    h.values.delete(keys[2]);
    const batches: string[][] = [];
    h.ledger.cachedMany = async (requested) => {
      batches.push(requested);
      return new Map(
        requested
          .slice()
          .reverse()
          .filter((key) => h.values.has(key))
          .map((key) => [key, h.values.get(key)]),
      );
    };
    const singleRead = h.ledger.cached.bind(h.ledger);
    h.ledger.cached = async (key) => {
      assert.ok(!keys.includes(key), 'Item cache must use one bulk lookup');
      return singleRead(key);
    };
    const reordered = candidates.slice().reverse();
    assert.deepEqual(
      await h.service.pending(topic, reordered),
      candidates.slice(0, 3).reverse(),
    );
    assert.equal(batches.length, 1);
    const result = await h.service.score(topic, reordered, 'bulk');
    assert.equal(batches.length, 2);
    assert.equal(h.calls.length, 2);
    assert.equal(JSON.parse(h.calls[1].prompt).candidates.length, 3);
    assert.deepEqual(result.unscoredIds, []);
    assert.deepEqual(
      new Set(result.scores.map((item) => item.id)),
      new Set(candidates.map((item) => item.id)),
    );
    assert.deepEqual(await h.service.pending(topic, candidates), []);
    const beforeEmpty = batches.length;
    assert.deepEqual(await h.service.pending(topic, []), []);
    assert.deepEqual(await h.service.score(topic, [], 'empty'), {
      scores: [],
      unscoredIds: [],
    });
    assert.equal(batches.length, beforeEmpty);
    h.ledger.cachedMany = async () => {
      throw new Error('bulk unavailable');
    };
    await assert.rejects(
      h.service.score(topic, candidates, 'failed-read'),
      /bulk unavailable/,
    );
    assert.equal(
      h.calls.length,
      2,
      'Read failure must not turn hits into paid misses',
    );
  }
});

void test('bulk item writes preserve original IDs, warm reuse and drain sibling batches on failure', async () => {
  for (const kind of ['article', 'social'] as const) {
    const h = harness(undefined, kind);
    const pool = Array.from({ length: 200 }, (_, i) => ({
      ...candidates[0],
      id: `original-${i}`,
    }));
    let writes = 0;
    let settled = 0;
    let fail = true;
    const failure = new Error('atomic batch failed');
    h.ledger.cacheMany = async (entries) => {
      writes++;
      const first = writes === 1;
      await new Promise((resolve) => setTimeout(resolve, first ? 1 : 10));
      settled++;
      if (fail && first) throw failure;
      for (const { key, response } of entries) h.values.set(key, response);
    };
    await assert.rejects(
      h.service.score(topic, pool, 'failed'),
      (e) => e === failure,
    );
    assert.equal(writes, 4);
    assert.equal(settled, 4, 'Failure must wait for sibling cache commits');
    assert.equal((await h.service.pending(topic, pool)).length, 50);
    fail = false;
    const recovered = await h.service.score(topic, pool, 'recovered');
    assert.equal(writes, 5);
    assert.deepEqual(
      new Set(recovered.scores.map((s) => s.id)),
      new Set(pool.map((c) => c.id)),
    );
    assert.deepEqual(recovered.unscoredIds, []);
    const calls = h.calls.length;
    assert.equal(
      (await h.service.score(topic, pool, 'warm')).scores.length,
      200,
    );
    assert.equal(writes, 5);
    assert.equal(h.calls.length, calls);
  }
});

void test('byte accounting preserves full-serialization batch boundaries in both modes', async () => {
  for (const kind of ['article', 'social'] as const) {
    for (const long of [false, true]) {
      const h = harness(undefined, kind);
      const pool = Array.from({ length: 200 }, (_, index) => ({
        id: `item-${index}-界`,
        title: `Quoted "title" ${index}\n`,
        excerpt: long ? (index % 2 ? '界' : '\\"\n').repeat(600) : null,
        sources: ['Outlet\t界'],
      }));
      const result = await h.service.score(topic, pool, 'byte-boundaries');
      assert.equal(result.scores.length, pool.length);
      const template = JSON.parse(h.calls[0].prompt) as Record<string, unknown>;
      const wire = (items: typeof pool) =>
        JSON.stringify({
          ...template,
          candidates: items.map((item, index) => ({
            ...item,
            originalId: item.id,
            id: String(index),
          })),
        });
      const expected: string[] = [];
      let batch: typeof pool = [];
      for (const item of pool) {
        const next = [...batch, item];
        if (
          batch.length &&
          (next.length > 50 ||
            Buffer.byteLength(h.calls[0].instructions + wire(next)) + 2048 >
              60000)
        ) {
          expected.push(wire(batch));
          batch = [];
        }
        batch.push(item);
      }
      if (batch.length) expected.push(wire(batch));
      assert.deepEqual(
        h.calls.map((call) => call.prompt),
        expected,
      );
      for (const call of h.calls)
        assert.ok(
          Buffer.byteLength(call.instructions + call.prompt) + 2048 <= 60000,
        );
    }
  }
});

void test('shared context hashing retains legacy item keys for escaped and truncated inputs', async () => {
  for (const kind of ['article', 'social'] as const) {
    const h = harness(undefined, kind);
    const unusualTopic = {
      id: 'topic\"\\雪',
      name: '雪'.repeat(210),
      description: 'quoted \" text\n'.repeat(250),
      guidance: '🚀'.repeat(1100),
    };
    const pool = Array.from({ length: 200 }, (_, i) => ({
      id: `item-${i}-雪`,
      title: 'escaped \" \\ 🚀'.repeat(80),
      excerpt: i % 2 ? null : 'line\n雪'.repeat(500),
      sources: Array.from({ length: 10 }, (_, n) => `${n}雪`.repeat(100)),
    }));
    await h.service.score(unusualTopic, pool, 'legacy-keys');
    const request = h.calls[0];
    const compactTopic = JSON.parse(request.prompt).topic;
    for (const candidate of pool) {
      const item = {
        id: candidate.id,
        title: candidate.title.slice(0, 500),
        excerpt: candidate.excerpt?.slice(0, 1800) ?? null,
        sources: candidate.sources
          .slice(0, 8)
          .map((source) => source.slice(0, 120)),
      };
      const key =
        (kind === 'social' ? 'social-triage-item-v1:' : 'triage-item-v1:') +
        createHash('sha256')
          .update(
            JSON.stringify({
              instructions: request.instructions,
              model: request.model.id,
              topic: compactTopic,
              item,
            }),
          )
          .digest('hex');
      assert.equal(
        (h.values.get(key) as { id: string } | undefined)?.id,
        candidate.id,
      );
    }
    const calls = h.calls.length;
    assert.deepEqual(
      await h.service.pending(unusualTopic, pool.slice().reverse()),
      [],
    );
    await h.service.score(unusualTopic, pool.slice().reverse(), 'warm');
    assert.equal(h.calls.length, calls);
  }
});

void test('article and social coverage repairs explain wire IDs and recover complete batches', async () => {
  for (const kind of ['article', 'social'] as const) {
    for (const defect of [
      'missing',
      'duplicate',
      'original',
      'extra',
    ] as const) {
      let attempts = 0;
      const h = harness((items) => {
        if (++attempts > 1) return { items };
        if (defect === 'missing') return { items: items.slice(1) };
        if (defect === 'duplicate') return { items: [items[0], items[0]] };
        if (defect === 'extra')
          return { items: [...items, { ...items[0], id: 'invented' }] };
        return {
          items: items.map((item) => ({ ...item, id: 'private-original-id' })),
        };
      }, kind);
      const pool = candidates
        .slice(0, 2)
        .map((item, index) => ({ ...item, id: `original-${index}` }));
      const result = await h.service.score(topic, pool, 'repair-coverage');
      assert.deepEqual(result.unscoredIds, []);
      assert.deepEqual(
        result.scores.map(({ id }) => id),
        pool.map(({ id }) => id),
      );
      assert.equal(h.calls.length, 2);
      assert.doesNotMatch(h.calls[0].instructions, /previous response failed/);
      assert.match(h.calls[1].prompt, /triage coverage check/);
      assert.match(
        h.calls[1].prompt,
        /EVERY batch-local candidate id exactly once/,
      );
      assert.doesNotMatch(h.calls[1].prompt, /private-original-id/);
      await h.service.score(topic, pool, 'warm-after-repair');
      assert.equal(h.calls.length, 2, 'Corrected original IDs are cached');
    }
  }
});

void test('production social triage preserves Bluesky evidence beyond the article title limit and keys its cache', async () => {
  const h = harness(undefined, 'social');
  const end = new Date('2026-11-03T12:00:00Z');
  const latest: BlueskyPost = {
    platform: 'bluesky',
    externalId: 'fixture',
    author: '\u0001'.repeat(200),
    url: 'https://bsky.app/profile/example.bsky.social/post/fixture',
    text: 'Playable prototype released today',
    publishedAt: '2026-11-03T10:00:00Z',
    observedAt: end.toISOString(),
    metrics: { likes: 20, reposts: 2, replies: 1 },
    media: Array.from({ length: 4 }, () => ({
      type: 'image' as const,
      thumbnail: 'https://example.com/thumb',
      fullsize: 'https://example.com/image',
      alt: '\u0001"'.repeat(125),
    })),
  };
  const earlier = {
    ...latest,
    observedAt: '2026-11-03T11:00:00Z',
    metrics: { likes: 10, reposts: 1, replies: 0 },
  };
  const run = () =>
    shortlistBlueskyPosts(
      h.service,
      topic,
      [earlier, latest],
      { includeAny: [], excludeAny: [] },
      new Date('2026-11-02T12:00:00Z'),
      end,
      5,
      'offline',
    );
  assert.equal((await run()).posts.length, 1);
  const wire = JSON.parse(h.calls[0].prompt.split('\nReturn only')[0])
    .candidates[0];
  assert.ok(wire.evidence.length > 500);
  assert.ok(wire.evidence.length <= 3000);
  const evidence = JSON.parse(wire.evidence);
  assert.equal(evidence.author, latest.author);
  assert.match(evidence.engagementEvidence, /"likes":10/);
  assert.match(evidence.media, /untrusted post data/);
  assert.equal(
    JSON.parse(evidence.media.slice(evidence.media.indexOf('[{'))).length,
    4,
  );
  assert.equal(wire.excerpt, latest.text);
  await run();
  assert.equal(h.calls.length, 1);
  latest.media![0].alt = 'Changed author description';
  await run();
  assert.equal(h.calls.length, 2);
});

void test('production X triage retains escaped author, reported counts and cache identity', async () => {
  const h = harness(undefined, 'social');
  const post = {
    platform: 'x' as const,
    externalId: 'fixture-x',
    url: 'https://x.com/example/status/123',
    author: '\u0001'.repeat(200),
    publishedAt: '2026-11-03T10:00:00Z',
    text: 'A concrete prototype released today',
    metrics: {},
    reasons: [],
    xTriageEvidence: { reportedLikes: 1700, media: 'linked' as const },
  };
  const run = () =>
    h.service.score(topic, [socialTriageCandidate(post)], 'offline');
  await run();
  const wire = JSON.parse(h.calls[0].prompt.split('\nReturn only')[0])
    .candidates[0];
  assert.equal(wire.title, 'X post');
  assert.equal(wire.excerpt, post.text);
  assert.ok(wire.evidence.length > 500);
  assert.ok(wire.evidence.length <= 3000);
  const evidence = JSON.parse(wire.evidence);
  assert.equal(evidence.author, post.author);
  assert.equal(evidence.publishedAt, post.publishedAt);
  assert.equal(evidence.reportedLikes, 1700);
  assert.match(evidence.likesEvidence, /unverified/);
  assert.match(evidence.media, /contents unknown/);
  await run();
  assert.equal(h.calls.length, 1);
  post.xTriageEvidence.reportedLikes = 1800;
  await run();
  assert.equal(h.calls.length, 2);
  post.publishedAt = '2026-11-03T11:00:00Z';
  await run();
  assert.equal(h.calls.length, 3);
  const changed = JSON.parse(h.calls[2].prompt.split('\nReturn only')[0])
    .candidates[0];
  assert.equal(JSON.parse(changed.evidence).publishedAt, post.publishedAt);
  assert.equal(changed.excerpt, post.text);
  assert.deepEqual(post.metrics, {});
});
