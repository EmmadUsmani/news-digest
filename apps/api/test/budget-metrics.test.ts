import assert from 'node:assert/strict';
import test from 'node:test';

import { Registry } from 'prom-client';

import { startBudgetMetrics } from '../src/modules/operations/adapters/budget-metrics';

void test('budget metrics expose enforced configuration ceilings without ledger or provider access', async () => {
  for (const [daily, monthly, expected] of [
    ['0.35', '9', [0.35, 9]],
    ['99', '99', [1, 14]],
    ['0', '0', [0, 0]],
  ] as const) {
    const registry = new Registry();
    startBudgetMetrics(registry, {
      LLM_DAILY_MAX_USD: daily,
      LLM_MONTHLY_BUDGET_USD: monthly,
      ANTHROPIC_API_KEY: 'must-never-appear',
    });
    const [metric] = await registry.getMetricsAsJSON();
    assert.equal(metric.values.length, 4);
    for (const [provider, values] of [
      ['anthropic', expected],
      ['xai', [0.4, 12]],
    ] as const) {
      for (const [index, period] of ['daily', 'monthly'].entries()) {
        assert.equal(
          metric.values.find(
            (v) => v.labels.provider === provider && v.labels.period === period,
          )?.value,
          values[index],
        );
      }
    }
    assert.ok(!(await registry.metrics()).includes('must-never-appear'));
  }
});
