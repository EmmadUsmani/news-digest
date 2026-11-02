import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  AnthropicLlmAdapter,
  isProviderSpendLimit,
} from '../src/modules/curation/adapters/anthropic';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
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
