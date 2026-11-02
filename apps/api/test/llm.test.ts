import assert from 'node:assert/strict';
import { test } from 'node:test';

import { z } from 'zod';

import {
  AnthropicLlmAdapter,
  isProviderSpendLimit,
  rateLimitDelay,
} from '../src/modules/curation/adapters/anthropic';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import {
  budgetAllowance,
  costMicros,
  utcBudgetPeriod,
} from '../src/modules/curation/domain/budget';
import {
  type LlmPort,
  type LlmRequest,
  type LlmResponse,
  ProviderSpendLimit,
} from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const config = llmConfig({});
const request: LlmRequest = {
  model: config.haiku,
  purpose: 'test',
  runId: 'offline',
  instructions: 'Return JSON with ok true.',
  prompt: 'Ready?',
  maxOutputTokens: 100,
};
const usage = { input: 40, cacheWrite: 12, cacheRead: 4, output: 8 };
class MemoryLedger implements LlmLedger {
  available = 1e6;
  blocked = false;
  calls: {
    estimate: number;
    cost?: number;
    error?: string;
    uncertain?: boolean;
  }[] = [];
  values = new Map<string, unknown>();
  async reserve(_request: LlmRequest, estimate: number) {
    if (this.blocked || estimate > this.available) return null;
    this.available -= estimate;
    this.calls.push({ estimate });
    return String(this.calls.length - 1);
  }
  async settle(id: string, _usage: typeof usage, cost: number) {
    const call = this.calls[Number(id)];
    call.cost = cost;
    this.available += call.estimate - cost;
  }
  async fail(id: string, code: string, limit: boolean, uncertain: boolean) {
    this.blocked ||= limit;
    const call = this.calls[Number(id)];
    call.error = code;
    call.uncertain = uncertain;
    if (!uncertain) this.available += call.estimate;
  }
  async cached(key: string) {
    return this.values.get(key);
  }
  async cache(key: string, value: unknown) {
    this.values.set(key, value);
  }
}
function valid(value: unknown): { ok: true } {
  assert.deepEqual(value, { ok: true });
  return { ok: true };
}
function fake(responses: (string | Error)[]) {
  let calls = 0;
  const llm: LlmPort = {
    async complete(): Promise<LlmResponse> {
      const result = responses[calls++];
      if (result instanceof Error) throw result;
      if (result === undefined) throw new Error('Unexpected extra request');
      return { text: result, usage };
    },
  };
  return { llm, count: () => calls };
}
void test('UTC budget allocation rolls unspent funds, includes leap/end-of-year days and caps daily spend', () => {
  const caps = { monthly: 14e6, dailyMax: 1e6 };
  assert.equal(
    budgetAllowance(new Date('2026-11-01Z'), { month: 0, today: 0 }, caps)
      .dailyCap,
    466666,
  );
  assert.deepEqual(
    budgetAllowance(
      new Date('2026-11-01T23:59Z'),
      { month: 300000, today: 300000 },
      caps,
    ),
    { dailyCap: 466666, available: 166666 },
  );
  assert.equal(
    budgetAllowance(new Date('2026-11-30Z'), { month: 12e6, today: 0 }, caps)
      .dailyCap,
    1e6,
  );
  assert.equal(
    budgetAllowance(new Date('2026-11-02Z'), { month: 0, today: 0 }, caps)
      .dailyCap,
    482758,
  );
  assert.equal(
    budgetAllowance(
      new Date('2026-11-30Z'),
      { month: 13900000, today: 0 },
      caps,
    ).available,
    100000,
  );
  assert.equal(
    budgetAllowance(
      new Date('2026-11-30Z'),
      { month: 14e6, today: 100000 },
      caps,
    ).available,
    0,
  );
  assert.equal(utcBudgetPeriod(new Date('2024-02-28T23:59Z')).daysLeft, 2);
  assert.equal(
    utcBudgetPeriod(new Date('2026-12-31Z')).nextMonth.toISOString(),
    '2027-01-01T00:00:00.000Z',
  );
  assert.throws(() =>
    budgetAllowance(new Date(), { month: -1, today: 0 }, caps),
  );
});
void test('configured pricing counts cache writes/reads separately and rejects unsafe amounts', () => {
  assert.equal(
    costMicros(
      {
        input: 1000000,
        cacheWrite: 1000000,
        cacheRead: 1000000,
        output: 1000000,
      },
      config.haiku,
    ),
    735000,
  );
  assert.equal(
    costMicros(
      { input: 1, cacheWrite: 0, cacheRead: 0, output: 0 },
      config.haiku,
    ),
    1,
  );
  assert.throws(() => costMicros({ ...usage, output: NaN }, config.haiku));
  assert.throws(() => costMicros(usage, { ...config.haiku, input: -1 }));
  assert.throws(() => llmConfig({ LLM_MONTHLY_BUDGET_USD: 'invalid' }));
  assert.equal(llmConfig({ LLM_MONTHLY_BUDGET_USD: '500' }).caps.monthly, 14e6);
  assert.equal(
    llmConfig({ LLM_TRIAGE_MODEL: 'configured' }).haiku.id,
    'configured',
  );
});
void test('budget refusal never contacts provider; pending calls consume funds', async () => {
  const ledger = new MemoryLedger();
  ledger.available = 0;
  const provider = fake(['{"ok":true}']);
  assert.equal(
    await new BudgetedLlm(provider.llm, ledger).json(request, valid),
    null,
  );
  assert.equal(provider.count(), 0);
  ledger.available = 100;
  assert.notEqual(await ledger.reserve(request, 75), null);
  assert.equal(await ledger.reserve(request, 75), null);
});
void test('validated results cache across run IDs and every paid attempt is settled', async () => {
  const ledger = new MemoryLedger(),
    provider = fake(['{"ok":true}']);
  const service = new BudgetedLlm(provider.llm, ledger);
  assert.deepEqual(await service.json(request, valid), { ok: true });
  assert.deepEqual(
    await service.json({ ...request, runId: 'new-edition' }, valid),
    { ok: true },
  );
  assert.equal(provider.count(), 1);
  assert.equal(ledger.calls[0].cost, costMicros(usage, config.haiku));
  assert.ok(ledger.calls[0].estimate > ledger.calls[0].cost);
});
void test('invalid JSON/schema gets one separately reserved repair, then returns fallback', async () => {
  for (const first of ['not JSON', '{"ok":false}']) {
    const ledger = new MemoryLedger(),
      provider = fake([first, '{"ok":true}']);
    assert.deepEqual(
      await new BudgetedLlm(provider.llm, ledger).json(request, valid),
      { ok: true },
    );
    assert.equal(ledger.calls.length, 2);
    assert.ok(ledger.calls.every((c) => c.cost !== undefined));
  }
  const ledger = new MemoryLedger(),
    provider = fake(['bad', 'still bad']);
  assert.equal(
    await new BudgetedLlm(provider.llm, ledger).json(request, valid),
    null,
  );
  assert.equal(provider.count(), 2);
  assert.equal(ledger.values.size, 0);
});
void test('provider spend errors block later calls; transport errors retain uncertain reservations', async () => {
  const ledger = new MemoryLedger(),
    provider = fake([new ProviderSpendLimit()]);
  const service = new BudgetedLlm(provider.llm, ledger);
  assert.equal(await service.json(request, valid), null);
  assert.equal(await service.json(request, valid), null);
  assert.equal(provider.count(), 1);
  assert.equal(ledger.calls[0].error, 'provider-spend-limit');
  const uncertain = new MemoryLedger(),
    transport = fake([new Error('connection lost')]);
  assert.equal(
    await new BudgetedLlm(transport.llm, uncertain).json(request, valid),
    null,
  );
  assert.equal(uncertain.calls[0].uncertain, true);
  assert.equal(uncertain.available, 1e6 - uncertain.calls[0].estimate);
});
void test('both documented spend-limit responses are recognized without matching ordinary rate limits', () => {
  assert.equal(
    isProviderSpendLimit(400, {
      error: {
        type: 'invalid_request_error',
        message: 'Your workspace API usage limits have been reached',
      },
    }),
    true,
  );
  assert.equal(
    isProviderSpendLimit(429, {
      error: { error_code: 'enforced_spend_limit_reached' },
    }),
    true,
  );
  assert.equal(
    isProviderSpendLimit(429, { error: { type: 'rate_limit_error' } }),
    false,
  );
  assert.equal(isProviderSpendLimit(401, { error: 'invalid API key' }), false);
});
void test('oversized UTF-8 input and unsafe output limits never reserve or call', async () => {
  const ledger = new MemoryLedger(),
    provider = fake([]),
    service = new BudgetedLlm(provider.llm, ledger);
  await assert.rejects(
    () => service.json({ ...request, prompt: '🙂'.repeat(25000) }, valid),
    /Split prompt/,
  );
  await assert.rejects(
    () => service.json({ ...request, maxOutputTokens: 0 }, valid),
    /Invalid output/,
  );
  assert.equal(ledger.calls.length, 0);
  assert.equal(provider.count(), 0);
});

void test('official SDK mocked HTTP spend failures make exactly one request and persist a block', async () => {
  for (const [status, body] of [
    [
      400,
      {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'Your workspace API usage limits have been reached',
        },
      },
    ],
    [
      429,
      {
        type: 'error',
        error: {
          type: 'rate_limit_error',
          error_code: 'enforced_spend_limit_reached',
          message: 'Spend limit',
        },
      },
    ],
  ] as const) {
    let calls = 0;
    const adapter = new AnthropicLlmAdapter('offline-fixture-key', async () => {
      calls++;
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', 'retry-after': '0' },
      });
    });
    const ledger = new MemoryLedger(),
      service = new BudgetedLlm(adapter, ledger);
    assert.equal(await service.json(request, valid), null);
    assert.equal(await service.json(request, valid), null);
    assert.equal(calls, 1);
    assert.equal(ledger.blocked, true);
  }
});
void test('SDK maps all four usage counters and requests prompt caching with no raw metadata leakage', async () => {
  const adapter = new AnthropicLlmAdapter(
    'offline-fixture-key',
    async (_url, options) => {
      assert.equal(typeof options?.body, 'string');
      if (typeof options?.body !== 'string')
        throw new Error('Expected JSON string request');
      const body: unknown = JSON.parse(options.body);
      assert.ok(JSON.stringify(body).includes('cache_control'));
      return new Response(
        JSON.stringify({
          id: 'fixture',
          type: 'message',
          role: 'assistant',
          model: config.haiku.id,
          content: [{ type: 'text', text: '{"ok":true}' }],
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: {
            input_tokens: 40,
            cache_creation_input_tokens: 12,
            cache_read_input_tokens: 4,
            output_tokens: 8,
          },
        }),
        { headers: { 'content-type': 'application/json' } },
      );
    },
  );
  const result = await adapter.complete(request);
  assert.deepEqual(result.usage, usage);
  assert.equal(result.text, '{"ok":true}');
});

void test('overlapping identical requests share one reservation and repair across run IDs', async () => {
  const ledger = new MemoryLedger();
  const provider = fake(['invalid', '{"ok":true}']);
  const service = new BudgetedLlm(provider.llm, ledger);
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      service.json({ ...request, runId: `run-${i}` }, valid),
    ),
  );
  assert.ok(results.every((result) => result?.ok === true));
  assert.equal(provider.count(), 2);
  assert.equal(ledger.calls.length, 2);
  assert.ok(ledger.calls.every((call) => call.cost !== undefined));
});

void test('coalescing releases failed work and preserves independent prompt identity', async () => {
  const ledger = new MemoryLedger();
  const provider = fake([
    new Error('offline transport'),
    '{"ok":true}',
    '{"ok":true}',
  ]);
  const service = new BudgetedLlm(provider.llm, ledger);
  assert.deepEqual(
    await Promise.all([
      service.json(request, valid),
      service.json(request, valid),
    ]),
    [null, null],
  );
  assert.equal(provider.count(), 1);
  assert.equal(ledger.calls[0].uncertain, true);
  assert.deepEqual(
    await Promise.all([
      service.json(request, valid),
      service.json({ ...request, prompt: 'Different input' }, valid),
    ]),
    [{ ok: true }, { ok: true }],
  );
  assert.equal(provider.count(), 3);
});

void test('ledger exceptions release coalesced work for a later attempt', async () => {
  const ledger = new MemoryLedger();
  let reads = 0;
  ledger.cached = async () => {
    if (reads++ === 0) throw new Error('offline database');
    return undefined;
  };
  const provider = fake(['{"ok":true}']);
  const service = new BudgetedLlm(provider.llm, ledger);
  const results = await Promise.allSettled([
    service.json(request, valid),
    service.json(request, valid),
  ]);
  assert.ok(results.every((result) => result.status === 'rejected'));
  assert.equal(provider.count(), 0);
  assert.deepEqual(await service.json(request, valid), { ok: true });
  assert.equal(provider.count(), 1);
});

void test('validation diagnostics distinguish parse, schema and semantic failures without retaining untrusted text', async () => {
  const cases = [
    { text: 'secret invalid JSON', validate: valid, category: 'invalid-json' },
    {
      text: '{}',
      validate: (value: unknown) =>
        z.object({ required: z.string() }).parse(value),
      category: 'invalid-schema',
    },
    {
      text: '{}',
      validate: () => {
        throw new LlmValidationFailure('invalid-selection');
      },
      category: 'invalid-selection',
    },
    {
      text: '{}',
      validate: () => {
        throw new LlmValidationFailure('unsupported-absence');
      },
      category: 'unsupported-absence',
    },
    {
      text: '{}',
      validate: () => {
        throw new Error('secret source or model text');
      },
      category: 'validator-error',
    },
  ];
  for (const entry of cases) {
    const provider = fake([entry.text, entry.text]);
    const ledger = new MemoryLedger();
    const llm = new BudgetedLlm(provider.llm, ledger);
    assert.equal(await llm.json(request, entry.validate), null);
    assert.deepEqual(llm.validationDiagnostics(), [
      { attempt: 'initial', category: entry.category },
      { attempt: 'repair', category: entry.category },
    ]);
    assert.equal(provider.count(), 2);
    assert.equal(ledger.values.size, 0);
    assert.ok(!JSON.stringify(llm.validationDiagnostics()).includes('secret'));
  }
});
void test('validation diagnostic storage is bounded and callers cannot mutate it', async () => {
  const provider = fake(Array<string>(40).fill('invalid'));
  const llm = new BudgetedLlm(provider.llm, new MemoryLedger());
  for (let i = 0; i < 20; i++) await llm.json(request, valid);
  const snapshot = llm.validationDiagnostics();
  assert.equal(snapshot.length, 32);
  snapshot[0].category = 'validator-error';
  snapshot.pop();
  assert.equal(llm.validationDiagnostics().length, 32);
  assert.equal(llm.validationDiagnostics()[0].category, 'invalid-json');
});

void test('diagnostics survive successful repair/cache reuse and classify invalid cached values without new calls', async () => {
  const provider = fake(['invalid', '{"ok":true}']);
  const ledger = new MemoryLedger();
  const llm = new BudgetedLlm(provider.llm, ledger);
  assert.deepEqual(await llm.json(request, valid), { ok: true });
  assert.deepEqual(await llm.json(request, valid), { ok: true });
  assert.deepEqual(llm.validationDiagnostics(), [
    { attempt: 'initial', category: 'invalid-json' },
  ]);
  for (const key of ledger.values.keys()) ledger.values.set(key, {});
  await assert.rejects(() =>
    llm.json(request, (value) =>
      z.object({ ok: z.literal(true) }).parse(value),
    ),
  );
  assert.deepEqual(llm.validationDiagnostics().at(-1), {
    attempt: 'cache',
    category: 'invalid-schema',
  });
  assert.equal(provider.count(), 2);
});

void test('rate-limit delays honor seconds and HTTP dates, with bounded fallback', () => {
  const now = Date.parse('2026-11-02T14:00:00Z');
  assert.equal(rateLimitDelay('3', 0, now), 3000);
  assert.equal(rateLimitDelay('0.5', 0, now), 1000);
  assert.equal(rateLimitDelay('Mon, 02 Nov 2026 14:00:05 GMT', 0, now), 5000);
  assert.equal(rateLimitDelay('Mon, 02 Nov 2026 13:59:00 GMT', 1, now), 2000);
  assert.equal(rateLimitDelay(null, 1, now), 2000);
  assert.equal(rateLimitDelay('invalid', 0, now), 1000);
  assert.equal(rateLimitDelay('11', 0, now), null);
});

void test('429 retries share one reservation and successful usage is recorded once', async () => {
  let calls = 0;
  const waits: number[] = [];
  const adapter = new AnthropicLlmAdapter(
    'offline-fixture-key',
    async () => {
      calls++;
      if (calls < 3)
        return new Response(
          JSON.stringify({
            type: 'error',
            error: { type: 'rate_limit_error', message: 'Rate limited' },
          }),
          {
            status: 429,
            headers: { 'content-type': 'application/json', 'retry-after': '3' },
          },
        );
      return new Response(
        JSON.stringify({
          id: 'fixture',
          type: 'message',
          role: 'assistant',
          model: config.haiku.id,
          content: [{ type: 'text', text: '{"ok":true}' }],
          stop_reason: 'end_turn',
          stop_sequence: null,
          usage: { input_tokens: 40, output_tokens: 8 },
        }),
        { headers: { 'content-type': 'application/json' } },
      );
    },
    (ms) => {
      waits.push(ms);
      return Promise.resolve();
    },
  );
  const ledger = new MemoryLedger();
  assert.deepEqual(
    await new BudgetedLlm(adapter, ledger).json(request, valid),
    { ok: true },
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [3000, 3000]);
  assert.equal(ledger.calls.length, 1);
  assert.ok(ledger.calls[0].cost !== undefined);
});

void test('rate-limit retries exhaust after three attempts; long deadlines and other failures never retry', async () => {
  for (const [status, retryAfter, expected] of [
    [429, '0', 3],
    [429, '11', 1],
    [500, '0', 1],
    [401, '0', 1],
    [0, '0', 1],
  ] as const) {
    let calls = 0;
    const waits: number[] = [];
    const adapter = new AnthropicLlmAdapter(
      'offline-fixture-key',
      async () => {
        calls++;
        if (!status) throw new Error('offline transport');
        return new Response(
          JSON.stringify({
            type: 'error',
            error: { type: 'rate_limit_error', message: 'Rejected' },
          }),
          {
            status,
            headers: {
              'content-type': 'application/json',
              'retry-after': retryAfter,
            },
          },
        );
      },
      (ms) => {
        waits.push(ms);
        return Promise.resolve();
      },
    );
    await assert.rejects(() => adapter.complete(request));
    assert.equal(calls, expected);
    assert.deepEqual(waits, expected === 3 ? [1000, 2000] : []);
  }
});
