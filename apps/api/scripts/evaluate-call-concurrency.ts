// Offline sensitivity analysis. No database, provider or environment access.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const callsSchema = z.array(
  z.object({
    purpose: z.string().min(1),
    durationMs: z.number().finite().nonnegative().safe(),
    outcome: z.enum(['success', 'error']),
  }),
);

export function evaluateCallConcurrency(input: unknown) {
  const calls = callsSchema.parse(input);
  return [
    { scope: 'all', calls },
    {
      scope: 'article-triage',
      calls: calls.filter((call) => call.purpose === 'candidate-triage-v1'),
    },
    {
      scope: 'ideal-article-cache-remainder',
      calls: calls.filter((call) => call.purpose !== 'candidate-triage-v1'),
    },
  ].map(({ scope, calls: selected }) => {
    const durations = selected.map((call) => call.durationMs);
    const totalMs = durations.reduce((sum, duration) => sum + duration, 0);
    if (!Number.isSafeInteger(totalMs)) throw new Error('Duration overflow');
    const longestMs = Math.max(0, ...durations);
    return {
      scope,
      calls: selected.length,
      failedCalls: selected.filter((call) => call.outcome === 'error').length,
      totalMs,
      longestMs,
      purposes: [...new Set(selected.map((call) => call.purpose))]
        .map((purpose) => {
          const matching = selected.filter((call) => call.purpose === purpose);
          return {
            purpose,
            calls: matching.length,
            failedCalls: matching.filter((call) => call.outcome === 'error')
              .length,
            totalMs: matching.reduce((sum, call) => sum + call.durationMs, 0),
            longestMs: Math.max(...matching.map((call) => call.durationMs)),
          };
        })
        .sort(
          (a, b) => b.totalMs - a.totalMs || a.purpose.localeCompare(b.purpose),
        ),
      concurrency: [1, 2, 4, 8, 16].map((slots) => {
        const workers = Array<number>(slots).fill(0);
        // Longest-first is an optimistic alternative order, not production
        // scheduling. All calls are assumed ready at time zero.
        for (const duration of [...durations].sort((a, b) => b - a)) {
          const earliest = workers.indexOf(Math.min(...workers));
          workers[earliest] += duration;
        }
        return {
          slots,
          lowerBoundMs: Math.max(longestMs, Math.ceil(totalMs / slots)),
          independentLongestFirstMs: Math.max(...workers),
        };
      }),
    };
  });
}

if (require.main === module) {
  console.log(
    JSON.stringify({
      note: 'Fixed observed HTTP durations only. All calls assumed independent and ready immediately. Lower bounds omit dependencies, rate limits, budget admission, cache/DB/queue work and latency changes under load. Longest-first is a hypothetical order, not an optimal schedule or a prediction. The ideal article-cache remainder removes only candidate-triage-v1 calls, assuming every article score is already cached; social triage, editing, failures and unknown purposes remain. Removed work still costs time and budget before publication; this is neither measured cache readiness nor an edition speedup prediction. Failed calls retain elapsed time; omitted calls cannot be inferred. No production concurrency change or paid calls.',
      results: evaluateCallConcurrency(
        JSON.parse(readFileSync(process.argv[2], 'utf8')),
      ),
    }),
  );
}
