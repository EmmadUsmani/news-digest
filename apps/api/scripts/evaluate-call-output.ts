// Offline provider-output evidence only. No environment, database or API access.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const tokens = z.number().int().nonnegative().safe();
const callsSchema = z.array(
  z.object({
    purpose: z.string().min(1),
    durationMs: tokens,
    outcome: z.enum(['success', 'failure', 'error']),
    usage: z.object({ output: tokens }).optional(),
    outputLimit: tokens.positive().optional(),
    completionReason: z.string().min(1).optional(),
  }),
);

export function evaluateCallOutput(input: unknown) {
  const calls = callsSchema.parse(input);
  return [...new Set(calls.map((call) => call.purpose))]
    .sort()
    .map((purpose) => {
      const selected = calls.filter((call) => call.purpose === purpose);
      const observed = selected.filter((call) => call.usage !== undefined);
      const paired = observed.filter((call) => call.outputLimit !== undefined);
      const outputTokens = observed.reduce(
        (sum, call) => sum + call.usage!.output,
        0,
      );
      const pairedOutputTokens = paired.reduce(
        (sum, call) => sum + call.usage!.output,
        0,
      );
      const pairedOutputLimit = paired.reduce(
        (sum, call) => sum + call.outputLimit!,
        0,
      );
      const totalMs = selected.reduce((sum, call) => sum + call.durationMs, 0);
      if (
        ![outputTokens, pairedOutputTokens, pairedOutputLimit, totalMs].every(
          Number.isSafeInteger,
        )
      )
        throw new Error('Output evidence overflow');
      return {
        purpose,
        calls: selected.length,
        failedCalls: selected.filter((call) => call.outcome !== 'success')
          .length,
        totalMs,
        callsWithUsage: observed.length,
        outputTokens: observed.length ? outputTokens : null,
        callsWithUsageAndLimit: paired.length,
        pairedOutputTokens: paired.length ? pairedOutputTokens : null,
        pairedOutputLimit: paired.length ? pairedOutputLimit : null,
        outputLimitUtilization: paired.length
          ? pairedOutputTokens / pairedOutputLimit
          : null,
        callsAtOrAboveOutputLimit: paired.length
          ? paired.filter((call) => call.usage!.output >= call.outputLimit!)
              .length
          : null,
        maxOutputLimitUtilization: paired.length
          ? paired.reduce(
              (maximum, call) =>
                Math.max(maximum, call.usage!.output / call.outputLimit!),
              0,
            )
          : null,
        reportedMaxTokenStops: selected.filter(
          (call) => call.completionReason === 'max_tokens',
        ).length,
        callsWithoutCompletionReason: selected.filter(
          (call) => call.completionReason === undefined,
        ).length,
      };
    });
}

if (require.main === module) {
  console.log(
    JSON.stringify({
      note: 'Recorded provider metadata only. Missing usage, limits and completion reasons stay unknown. Utilization uses only calls with both usage and limits; reaching a limit does not prove truncation; it is not reserved budget, avoidable work or a latency prediction. Failed calls retain duration and any recorded usage. HTTP success does not prove editorial validation. No inference, production changes or prompt edits.',
      purposes: evaluateCallOutput(
        JSON.parse(readFileSync(process.argv[2], 'utf8')),
      ),
    }),
  );
}
