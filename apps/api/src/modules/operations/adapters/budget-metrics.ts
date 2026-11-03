import { Gauge, type Registry } from 'prom-client';

import { configuredLlmCaps } from '../../curation/public/usage';
import { xDiscoveryCaps } from '../../social/public/usage';

// No ledger access, budget locks, or provider calls during collection.
export function startBudgetMetrics(
  registry: Registry,
  env: NodeJS.ProcessEnv = process.env,
) {
  const caps = { anthropic: configuredLlmCaps(env), xai: xDiscoveryCaps };
  const gauge = new Gauge({
    name: 'news_digest_provider_configured_ceiling_usd',
    help: 'Configured provider ceiling in USD, not current allowance or available funds.',
    labelNames: ['provider', 'period'],
    registers: [registry],
  });
  for (const [provider, cap] of Object.entries(caps)) {
    gauge.set({ provider, period: 'daily' }, cap.dailyMicros / 1e6);
    gauge.set({ provider, period: 'monthly' }, cap.monthlyMicros / 1e6);
  }
}
