// Offline provider usage analysis; no environment, database or network access.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const count = z.number().int().nonnegative().safe();
const callsSchema = z.array(
  z.object({
    purpose: z.string().min(1),
    model: z.string().min(1),
    durationMs: count,
    outcome: z.enum(['success', 'error']),
    usage: z
      .object({
        input: count,
        cacheWrite: count,
        cacheRead: count,
        output: count,
      })
      .optional(),
    outputLimit: count.positive().optional(),
    completionReason: z.string().optional(),
  }),
);

export function evaluateCallTokens(input: unknown) {
  const calls = callsSchema.parse(input);
  const groups = new Map<string, typeof calls>();
  for (const call of calls) {
    const key = JSON.stringify([call.purpose, call.model]);
    const group = groups.get(key) ?? [];
    group.push(call);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => {
      const known = group.filter((call) => call.usage !== undefined);
      const sum = (values: number[]) => {
        const total = values.reduce((a, b) => a + b, 0);
        if (!Number.isSafeInteger(total))
          throw new Error('Usage total overflow');
        return total;
      };
      const durationMs = sum(group.map((call) => call.durationMs));
      const knownUsageDurationMs = sum(known.map((call) => call.durationMs));
      const inputTokens = sum(known.map((call) => call.usage!.input));
      const cacheWriteTokens = sum(known.map((call) => call.usage!.cacheWrite));
      const cacheReadTokens = sum(known.map((call) => call.usage!.cacheRead));
      const outputTokens = sum(known.map((call) => call.usage!.output));
      return {
        purpose: group[0].purpose,
        model: group[0].model,
        calls: group.length,
        failedCalls: group.filter((call) => call.outcome === 'error').length,
        unknownUsageCalls: group.length - known.length,
        durationMs,
        knownUsageDurationMs,
        inputTokens,
        cacheWriteTokens,
        cacheReadTokens,
        totalInputTokens: sum([inputTokens, cacheWriteTokens, cacheReadTokens]),
        outputTokens,
        // Includes prefill/network time; never label this decode throughput.
        outputTokensPerHttpSecond:
          knownUsageDurationMs > 0
            ? (outputTokens * 1000) / knownUsageDurationMs
            : null,
        outputLimitStops: group.filter(
          (call) => call.completionReason === 'max_tokens',
        ).length,
        largestOutputTokens: known.length
          ? Math.max(...known.map((call) => call.usage!.output))
          : null,
      };
    })
    .sort(
      (a, b) =>
        b.durationMs - a.durationMs ||
        a.purpose.localeCompare(b.purpose) ||
        a.model.localeCompare(b.model),
    );
}

if (require.main === module)
  console.log(
    JSON.stringify({
      note: 'Recorded HTTP calls grouped by purpose and model. Token totals include only calls with usage; missing usage is unknown. Input includes uncached, cache-write and cache-read tokens separately. Output tokens per HTTP second includes prefill/network time and is not decode speed or a causal latency estimate. Provider-success calls may fail application validation; repairs cannot be identified from usage alone. No provider requests or production changes.',
      results: evaluateCallTokens(
        JSON.parse(readFileSync(process.argv[2], 'utf8')),
      ),
    }),
  );
