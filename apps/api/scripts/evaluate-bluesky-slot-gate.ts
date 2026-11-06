// Offline worksheet only: no database, provider, setting writes or activation.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const money = z.number().int().nonnegative().max(1_000_000_000);
const schema = z.object({
  editionDate: z.literal('2026-11-06'),
  editionId: z.string().uuid(),
  fullyAiEdited: z.boolean(),
  budgetRefused: z.boolean(),
  usageSettled: z.boolean(),
  editionCostMicros: money,
  dailyCapMicros: money,
  // Include every enabled topic with a nonzero post budget, including no-slot topics.
  topics: z
    .array(
      z.object({
        topicId: z.string().min(1),
        extraCostMicros: money.nullable(),
        // Explain the estimate from Nov 6 saved triage/editor usage, not a paid trial.
        basis: z.string().trim().min(1),
      }),
    )
    .min(1)
    .max(100),
});

export function evaluateBlueskySlotGate(input: unknown) {
  const data = schema.parse(input);
  if (
    new Set(data.topics.map((topic) => topic.topicId)).size !==
    data.topics.length
  )
    throw new Error('Duplicate topic estimate');
  const reasons: string[] = [];
  if (!data.fullyAiEdited) reasons.push('Edition was not fully AI-edited');
  if (data.budgetRefused) reasons.push('An AI step was refused for budget');
  if (!data.usageSettled) reasons.push('Edition usage is not settled');
  const missing = data.topics.filter((topic) => topic.extraCostMicros === null);
  if (missing.length)
    reasons.push('Extra Bluesky cost is unknown for one or more topics');
  const extraCostMicros = missing.length
    ? null
    : data.topics.reduce((sum, topic) => sum + topic.extraCostMicros!, 0);
  const protectedCostMicros =
    extraCostMicros === null
      ? null
      : Math.ceil((3 * (data.editionCostMicros + extraCostMicros)) / 2);
  if (protectedCostMicros !== null && protectedCostMicros > data.dailyCapMicros)
    reasons.push(
      '1.5 times edition plus extra Bluesky cost exceeds the daily cap',
    );
  return {
    editionId: data.editionId,
    eligible: reasons.length === 0,
    extraCostMicros,
    protectedCostMicros,
    dailyCapMicros: data.dailyCapMicros,
    reasons,
    note: 'Offline calculation only. Verify complete topic coverage and saved evidence; enable only after 16:00 UTC. Runtime admission and reserve protection still apply.',
  };
}

if (require.main === module)
  console.log(
    JSON.stringify(
      evaluateBlueskySlotGate(
        JSON.parse(readFileSync(process.argv[2], 'utf8')),
      ),
    ),
  );
