import type { BudgetCaps } from '../domain/budget';
import type { ModelPrice } from '../domain/llm.port';
import type { ScheduledReservePolicy } from '../domain/scheduled-reserve';

export function llmConfig(env: NodeJS.ProcessEnv = process.env) {
  const amount = (name: string, fallback: number) => {
    const n = Number(env[name] ?? fallback);
    if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${name}`);
    return n;
  };
  const model = (
    role: string,
    id: string,
    input: number,
    read: number,
    output: number,
  ): ModelPrice => ({
    id: env[`LLM_${role}_MODEL`] ?? id,
    input: amount(`LLM_${role}_INPUT_USD_PER_MILLION`, input),
    // Anthropic's five-minute cache creation costs 1.25x regular input.
    cacheWrite: amount(`LLM_${role}_CACHE_WRITE_USD_PER_MILLION`, input * 1.25),
    cacheRead: amount(`LLM_${role}_CACHE_READ_USD_PER_MILLION`, read),
    output: amount(`LLM_${role}_OUTPUT_USD_PER_MILLION`, output),
  });
  const haiku = model('TRIAGE', 'claude-haiku-5-5', 0.1, 0.01, 0.5);
  const sonnet = model('EDITOR', 'claude-sonnet-5-5', 2, 0.1, 10);
  const dailyFraction = amount('LLM_EDITOR_DAILY_FRACTION', 0.8);
  if (dailyFraction > 1) throw new Error('Invalid LLM_EDITOR_DAILY_FRACTION');
  if (sonnet.id === haiku.id)
    throw new Error(
      'Editor and triage models must differ for budget allocation',
    );
  const caps: BudgetCaps = {
    modelAllocation: { model: sonnet.id, dailyFraction },
    monthly: Math.floor(
      Math.min(20, amount('LLM_MONTHLY_BUDGET_USD', 20)) * 1e6,
    ),
    dailyMax: Math.floor(
      Math.min(0.65, amount('LLM_DAILY_MAX_USD', 0.65)) * 1e6,
    ),
  };
  return {
    caps,
    haiku,
    sonnet,
  };
}

// Parse even while disabled so invalid deployment configuration fails early.
export function scheduledReserveConfig(env: NodeJS.ProcessEnv = process.env) {
  const enabled = env.LLM_SCHEDULED_RESERVE_ENABLED ?? '0';
  if (!['0', '1'].includes(enabled))
    throw new Error('Invalid LLM_SCHEDULED_RESERVE_ENABLED');
  const headroom = Number(env.LLM_SCHEDULED_RESERVE_HEADROOM ?? 1.5);
  if (!Number.isFinite(headroom) || headroom < 1)
    throw new Error('Invalid LLM_SCHEDULED_RESERVE_HEADROOM');
  const raw = env.LLM_SCHEDULED_RESERVE_MICROS;
  const configuredMicros = raw === undefined ? undefined : Number(raw);
  if (
    raw !== undefined &&
    (!/^\d+$/.test(raw) || !Number.isSafeInteger(configuredMicros))
  )
    throw new Error('Invalid LLM_SCHEDULED_RESERVE_MICROS');
  const policy: ScheduledReservePolicy = { headroom, configuredMicros };
  return { enabled: enabled === '1', policy };
}
