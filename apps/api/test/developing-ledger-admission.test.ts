import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developingEditionBudget } from '../../../scripts/lib/developing-edition-budget';
import { database } from '../src/libs/db/connections';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import { reserveLlmPlan } from '../src/modules/curation/application/reserved-llm-plan';
import { runCapturedDevelopingLlmPlan } from '../src/modules/curation/application/run-reserved-llm-plan';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';
import { readUsage } from '../src/modules/curation/database/usage.reader';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import { enrichSelectedDevelopingStories } from '../src/modules/digests/application/enrich-selected-developing-stories';

void test('five-topic enrichment settles in PostgreSQL and stale preflight cannot spend a competing hold', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const config = llmConfig({});
  const caps = {
    monthly: 20e6,
    dailyMax: 650000,
    modelAllocation: { model: config.sonnet.id, dailyFraction: 0.8 },
  };
  const ledger = new PostgresLlmLedger(db, caps);
  const cacheKeys: string[] = [];
  const cache = ledger.cache.bind(ledger);
  ledger.cache = async (key, value) => {
    cacheKeys.push(key);
    await cache(key, value);
  };
  const requests: LlmRequest[] = [];
  const usage = { input: 10, output: 10, cacheRead: 0, cacheWrite: 0 };
  const selected = [
    { id: 'a', title: 'Launch', summary: 'Original', whyItMatters: 'Impact' },
  ];
  const budgeted = new BudgetedLlm(
    {
      async complete(request) {
        requests.push(request);
        return {
          text: JSON.stringify(
            request.purpose === 'story-grouping-v3'
              ? { groups: [['current:0', 'history:0:0']] }
              : [
                  {
                    id: 'a',
                    title: 'Product ships',
                    summary: 'The company began shipping today.',
                    whyItMatters: 'Customers can receive the product.',
                  },
                ],
          ),
          usage,
        };
      },
    },
    ledger,
  );
  const run = (suffix: string) =>
    Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        enrichSelectedDevelopingStories({
          selected,
          evidence: [
            {
              id: 'a',
              title: `Launch ${index} begins`,
              excerpt: 'The company began shipping its product today.',
              sources: ['Publisher'],
            },
          ],
          model: config.sonnet,
          runId: `developing-ledger-${suffix}`,
          topicId: `topic-${index}`,
          topicName: `Tech ${index}`,
          editorialMode: 'ai',
          history: [
            {
              editionId: '00000000-0000-4000-8000-000000000001',
              publishedAt: '2026-11-17T15:00:00Z',
              stories: [
                {
                  id: '00000000-0000-4000-8000-000000000002',
                  title: 'Launch announced',
                  summary: 'Shipping was planned.',
                },
              ],
            },
          ],
          publishedAt: '2026-11-18T15:00:00Z',
          grouping: new EventGrouping(budgeted, config.haiku),
          llm: {
            async complete(request, execution) {
              const result = await budgeted.jsonOutcome(
                request,
                (value) => value,
                { repair: false, execution },
              );
              if (result.status !== 'complete') throw new Error(result.status);
              return { text: JSON.stringify(result.value), usage };
            },
          },
        }),
      ),
    );
  const protectedRequest: LlmRequest = {
    model: config.haiku,
    runId: 'developing-ledger-protected',
    purpose: 'protected-edition-work',
    instructions: '',
    prompt: '',
    maxOutputTokens: 1,
  };
  try {
    const protectedId = await ledger.reserve(protectedRequest, 10000);
    assert.ok(protectedId);
    const results = await run('success');
    assert.ok(results.every((result) => result.status === 'rewritten'));
    assert.equal(requests.length, 10);
    for (let index = 0; index < 5; index++) {
      assert.deepEqual(
        requests
          .filter((request) => request.topicId === `topic-${index}`)
          .map((request) => request.purpose),
        ['story-grouping-v3', 'developing-rewrite'],
      );
    }
    const report = developingEditionBudget({
      now: new Date(),
      totals: { month: 0, today: 0 },
      caps,
      modelToday: { [config.sonnet.id]: 0 },
      protectedMicros: 10000,
      protectedModelMicros: { [config.sonnet.id]: 0 },
      requests,
    });
    assert.equal(report.status, 'fits-supplied-plan');
    const rows = await db.query<{
      status: string;
      reserved_micros: string;
      cost_micros: string;
    }>(
      'SELECT status,reserved_micros,cost_micros FROM llm_calls WHERE run_id=$1',
      ['developing-ledger-success'],
    );
    assert.equal(rows.rows.length, 10);
    assert.ok(rows.rows.every((row) => row.status === 'succeeded'));
    assert.equal(
      rows.rows.reduce((sum, row) => sum + Number(row.reserved_micros), 0),
      report.featureMicros,
    );
    const settled = rows.rows.reduce(
      (sum, row) => sum + Number(row.cost_micros),
      0,
    );
    const status = await readUsage(db, caps);
    assert.equal(
      status.availableMicros,
      status.dailyCapMicros - 10000 - settled,
    );
    await ledger.fail(protectedId, 'test-cleanup', false, false);
    await db.query('DELETE FROM llm_cache WHERE cache_key=ANY($1::text[])', [
      cacheKeys,
    ]);
    // The same offline plan still fits an empty snapshot. Another process can
    // consume that headroom before dispatch; preflight is never a reservation.
    const competing = await ledger.reserve(
      { ...protectedRequest, runId: 'developing-ledger-competing' },
      status.dailyCapMicros - settled,
    );
    assert.ok(competing);
    const refused = await run('stale');
    assert.ok(
      refused.every(
        (result) =>
          result.status === 'unchanged' && result.stories === selected,
      ),
    );
    assert.equal(
      requests.length,
      10,
      'no provider dispatch after competing hold',
    );
    assert.equal((await readUsage(db, caps)).availableMicros, 0);
    assert.equal(
      (
        await db.query('SELECT id FROM llm_calls WHERE run_id=$1', [
          'developing-ledger-stale',
        ])
      ).rowCount,
      0,
    );
  } finally {
    await db.query(
      "DELETE FROM llm_calls WHERE run_id LIKE 'developing-ledger-%'",
    );
    await db.query('DELETE FROM llm_cache WHERE cache_key=ANY($1::text[])', [
      cacheKeys,
    ]);
    await db.end();
  }
});

void test('edition batch reservations roll back refusals and serialize competing plans', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const config = llmConfig({});
  const caps = {
    monthly: 100e6,
    dailyMax: 100000,
    modelAllocation: { model: config.sonnet.id, dailyFraction: 0.5 },
  };
  const ledger = new PostgresLlmLedger(db, caps);
  const entry = (runId: string, estimate: number, sonnet = false) => ({
    estimate,
    request: {
      runId,
      model: sonnet ? config.sonnet : config.haiku,
      purpose: 'developing-batch-test',
      instructions: '',
      prompt: '',
      maxOutputTokens: 1,
    },
  });
  const count = async (runId: string) =>
    (await db.query('SELECT id FROM llm_calls WHERE run_id=$1', [runId]))
      .rowCount;
  try {
    const model = await ledger.reserveBatch([
      entry('developing-batch-model', 30000, true),
      entry('developing-batch-model', 30000, true),
    ]);
    assert.deepEqual(model, {
      status: 'refused',
      index: 1,
      reasons: ['model-allocation'],
    });
    assert.equal(await count('developing-batch-model'), 0);
    const shared = await ledger.reserveBatch([
      entry('developing-batch-shared', 60000),
      entry('developing-batch-shared', 60000),
    ]);
    assert.deepEqual(shared, {
      status: 'refused',
      index: 1,
      reasons: ['daily-cap'],
    });
    assert.equal(await count('developing-batch-shared'), 0);
    const verification = new PostgresLlmLedger(db, caps, true);
    assert.deepEqual(
      await verification.reserveBatch([
        entry('developing-batch-verification', 30000),
        entry('developing-batch-verification', 30000),
      ]),
      { status: 'refused', index: 1, reasons: ['verification-cap'] },
    );
    assert.equal(await count('developing-batch-verification'), 0);
    for (const entries of [
      [],
      [entry('developing-batch-invalid', 0)],
      [entry('developing-batch-invalid', 1), entry('different-run', 1)],
      Array.from({ length: 65 }, () => entry('developing-batch-invalid', 1)),
    ]) {
      await assert.rejects(
        ledger.reserveBatch(entries),
        /Invalid reservation batch/,
      );
    }
    const outcomes = await Promise.all(
      ['a', 'b'].map((suffix) =>
        ledger.reserveBatch([
          entry(`developing-batch-${suffix}`, 30000),
          entry(`developing-batch-${suffix}`, 30000),
        ]),
      ),
    );
    assert.equal(
      outcomes.filter((result) => result.status === 'admitted').length,
      1,
    );
    assert.equal(
      outcomes.filter((result) => result.status === 'refused').length,
      1,
    );
    for (const [index, outcome] of outcomes.entries()) {
      assert.equal(
        await count(`developing-batch-${index === 0 ? 'a' : 'b'}`),
        outcome.status === 'admitted' ? 2 : 0,
      );
      if (outcome.status === 'admitted') {
        assert.equal(new Set(outcome.ids).size, 2);
        await ledger.settle(
          outcome.ids[0],
          { input: 1, output: 0, cacheRead: 0, cacheWrite: 0 },
          1,
        );
        await ledger.fail(outcome.ids[1], 'unused-plan-hold', false, false);
      }
    }
    const usage = await readUsage(db, caps);
    assert.equal(usage.availableMicros, 99999);
  } finally {
    await db.query(
      "DELETE FROM llm_calls WHERE run_id LIKE 'developing-batch-%'",
    );
    await db.end();
  }
});

void test('protected plan holds block competitors until scope cleanup in PostgreSQL', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const caps = { monthly: 100e6, dailyMax: 100000 };
  const ledger = new PostgresLlmLedger(db, caps);
  const request: LlmRequest = {
    runId: 'developing-protected-plan',
    purpose: 'feature',
    instructions: '',
    prompt: '',
    maxOutputTokens: 10000,
    model: {
      id: 'offline-protected',
      input: 0,
      cacheRead: 0,
      cacheWrite: 0,
      output: 3,
    },
  };
  const protectedRequest = {
    ...request,
    purpose: 'morning-editor',
    model: { ...request.model, id: 'offline-morning-editor', output: 6 },
  };
  try {
    const plan = await reserveLlmPlan(ledger, [request], [protectedRequest]);
    assert.ok(plan);
    try {
      assert.equal((await readUsage(db, caps)).availableMicros, 10000);
      assert.equal(
        await ledger.reserve({ ...request, purpose: 'competitor' }, 20000),
        null,
      );
      assert.equal(await plan.ledger.reserve(protectedRequest, 60000), null);
      const llm = new BudgetedLlm(
        {
          complete: async () => ({
            text: '{"ok":true}',
            usage: { input: 0, output: 1, cacheRead: 0, cacheWrite: 0 },
          }),
        },
        plan.ledger,
      );
      assert.equal(
        (await llm.jsonOutcome(request, (value) => value)).status,
        'complete',
      );
      assert.equal((await readUsage(db, caps)).availableMicros, 39997);
      assert.equal(
        await ledger.reserve({ ...request, purpose: 'competitor' }, 40000),
        null,
      );
    } finally {
      await plan.releaseUnused();
    }
    assert.equal((await readUsage(db, caps)).availableMicros, 99997);
    const resumed = await ledger.reserve(protectedRequest, 60000);
    assert.ok(resumed);
    await ledger.fail(resumed, 'offline-cleanup', false, false);
  } finally {
    await db.query(
      "DELETE FROM llm_calls WHERE run_id='developing-protected-plan'",
    );
    await db.end();
  }
});

void test('captured execution in PostgreSQL admits all work, cleans before return and retains uncertain spend', async () => {
  assert.equal(process.env.NEWS_DIGEST_ISOLATED_TEST, '1');
  const db = database();
  const cacheKeys: string[] = [];
  try {
    for (const scenario of [
      'success',
      'cached',
      'uncertain',
      'refused',
    ] as const) {
      const editionId = `developing-captured-${scenario}`;
      const caps = {
        monthly: 100e6,
        dailyMax: scenario === 'refused' ? 99999 : 100000,
      };
      const ledger = new PostgresLlmLedger(db, caps);
      const cache = ledger.cache.bind(ledger);
      ledger.cache = async (key, value) => {
        cacheKeys.push(key);
        await cache(key, value);
      };
      const request: LlmRequest = {
        runId: editionId,
        topicId: 'tech',
        purpose: 'story-grouping-v3',
        instructions: 'Return JSON',
        prompt: scenario,
        maxOutputTokens: 10000,
        model: {
          id: 'offline-captured',
          input: 0,
          cacheRead: 0,
          cacheWrite: 0,
          output: 2,
        },
      };
      const rewrite = {
        ...request,
        purpose: 'developing-rewrite',
        prompt: scenario === 'cached' ? request.prompt : `${scenario} rewrite`,
      };
      const protectedRequest = {
        ...request,
        purpose: 'morning-editor',
        model: { ...request.model, id: 'offline-protected-editor', output: 6 },
      };
      const capture = (item: LlmRequest) => ({
        editionId,
        topicId: 'tech',
        status: 'request-ready',
        request: item,
      });
      let dispatches = 0;
      let executions = 0;
      const result = await runCapturedDevelopingLlmPlan({
        captures: {
          editionId,
          topicIds: ['tech'],
          matching: [capture(request)],
          rewrites: [capture(rewrite)],
          additionalRequests: [],
        },
        ledger,
        protectedRequests: [protectedRequest],
        provider: {
          async complete() {
            dispatches++;
            if (scenario === 'uncertain')
              throw new Error('offline transport failure');
            return {
              text: '{"ok":true}',
              usage: { input: 0, output: 1, cacheRead: 0, cacheWrite: 0 },
            };
          },
        },
        async execute(llm) {
          executions++;
          // All three holds exist before services can dispatch; no second reservation.
          assert.equal((await readUsage(db, caps)).availableMicros, 0);
          assert.equal(
            await ledger.reserve({ ...request, purpose: 'competitor' }, 1),
            null,
          );
          const match = await llm.jsonOutcome(request, (value) => value, {
            repair: false,
          });
          if (match.status !== 'complete') return match.status;
          return (
            await llm.jsonOutcome(rewrite, (value) => value, { repair: false })
          ).status;
        },
      });
      assert.deepEqual(
        result,
        scenario === 'refused'
          ? { status: 'admission-refused' }
          : {
              status: 'completed',
              value:
                scenario === 'uncertain' ? 'provider-call-failed' : 'complete',
            },
      );
      assert.equal(executions, scenario === 'refused' ? 0 : 1);
      assert.equal(
        dispatches,
        scenario === 'success' ? 2 : scenario === 'refused' ? 0 : 1,
      );
      const rows = await db.query<{
        purpose: string;
        status: string;
        cost: number | null;
      }>(
        'SELECT purpose,status,cost_micros::float8 AS cost FROM llm_calls WHERE run_id=$1 ORDER BY purpose',
        [editionId],
      );
      assert.deepEqual(
        rows.rows,
        scenario === 'refused'
          ? []
          : [
              {
                purpose: 'developing-rewrite',
                status: scenario === 'success' ? 'succeeded' : 'failed',
                cost: scenario === 'success' ? 2 : null,
              },
              { purpose: 'morning-editor', status: 'failed', cost: null },
              {
                purpose: 'story-grouping-v3',
                status: scenario === 'uncertain' ? 'uncertain' : 'succeeded',
                cost: scenario === 'uncertain' ? null : 2,
              },
            ],
      );
      // Cleanup completed before returning: only actual spend or the uncertain
      // dispatched hold remains charged, never the unused rewrite/protected work.
      assert.equal(
        (await readUsage(db, caps)).availableMicros,
        caps.dailyMax -
          (scenario === 'success'
            ? 4
            : scenario === 'cached'
              ? 2
              : scenario === 'uncertain'
                ? 20000
                : 0),
      );
      await db.query('DELETE FROM llm_calls WHERE run_id=$1', [editionId]);
    }
  } finally {
    await db.query(
      "DELETE FROM llm_calls WHERE run_id LIKE 'developing-captured-%'",
    );
    await db.query('DELETE FROM llm_cache WHERE cache_key=ANY($1::text[])', [
      cacheKeys,
    ]);
    await db.end();
  }
});
