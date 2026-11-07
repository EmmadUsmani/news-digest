// Read-only, local-only evidence collection. No force merge or provider calls.
import { setTimeout } from 'node:timers/promises';

import { mergeInterval, type MergeSnapshot } from './lib/metrics-recovery';

async function get(path: string) {
  const response = await fetch(path, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
  return response;
}

async function sample() {
  const queries = [
    'up{job="metrics-store"}',
    'news_digest_unit_active{scope="user",unit="news-digest-api.service"}',
  ];
  const [metrics, rules, ...probes] = await Promise.all([
    get('http://127.0.0.1:8428/metrics/metrics').then((r) => r.text()),
    get('http://127.0.0.1:8880/api/v1/rules').then((r) => r.json()),
    ...queries.map(async (query) => {
      const started = performance.now();
      const params = new URLSearchParams({ query, nocache: '1' });
      const result = await get(
        `http://127.0.0.1:8428/metrics/api/v1/query?${params}`,
      ).then((r) => r.json());
      if (
        result.status !== 'success' ||
        result.data.result.length !== 1 ||
        Number(result.data.result[0].value[1]) !== 1
      )
        throw new Error(`Unhealthy query: ${query}`);
      return { query, seconds: (performance.now() - started) / 1000 };
    }),
  ]);
  const counter = (name: string) => {
    const line = metrics.split('\n').find((row) => row.startsWith(`${name} `));
    const value = line ? Number(line.slice(name.length + 1)) : NaN;
    if (!Number.isFinite(value)) throw new Error(`Missing counter: ${name}`);
    return value;
  };
  if (rules.status !== 'success') throw new Error('Rules API unsuccessful');
  const evaluations = rules.data.groups.flatMap(
    (group: {
      rules: {
        health: string;
        lastError: string;
        lastEvaluation: string;
        name: string;
      }[];
    }) => group.rules,
  );
  if (
    !evaluations.length ||
    evaluations.some(
      (rule: { health: string; lastError: string; lastEvaluation: string }) =>
        rule.health !== 'ok' ||
        rule.lastError ||
        !(Date.now() - Date.parse(rule.lastEvaluation) < 120_000),
    )
  )
    throw new Error('Unhealthy or stale rule evaluation');
  return {
    at: new Date().toISOString(),
    counters: {
      processStart: counter('process_start_time_seconds'),
      rows: counter('vm_rows_merged_total{type="storage/small"}'),
      merges: counter('vm_merges_total{type="storage/small"}'),
    } satisfies MergeSnapshot,
    bigCounters: {
      processStart: counter('process_start_time_seconds'),
      rows: counter('vm_rows_merged_total{type="storage/big"}'),
      merges: counter('vm_merges_total{type="storage/big"}'),
    } satisfies MergeSnapshot,
    admissionLimit: counter('vm_concurrent_select_limit_reached_total'),
    queueTimeouts: counter('vm_concurrent_select_limit_timeout_total'),
    slowQueries: counter('vm_slow_queries_total'),
    healthyRules: evaluations.length,
    probes,
  };
}

async function main() {
  const intervals = Number(process.argv[2] ?? 6);
  const seconds = Number(process.argv[3] ?? 30);
  if (
    !Number.isInteger(intervals) ||
    intervals < 1 ||
    intervals > 360 ||
    !Number.isFinite(seconds) ||
    seconds < 1 ||
    seconds > 60
  )
    throw new Error(
      'Usage: tsx scripts/sample-metrics-recovery.ts [intervals 1–360] [seconds 1–60]',
    );
  let previous = await sample();
  console.log(JSON.stringify(previous));
  for (let index = 0; index < intervals; index++) {
    await setTimeout(seconds * 1000);
    const current = await sample();
    console.log(
      JSON.stringify({
        ...current,
        interval: {
          small: mergeInterval(previous.counters, current.counters),
          big: mergeInterval(previous.bigCounters, current.bigCounters),
        },
      }),
    );
    previous = current;
  }
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
