// Offline prospective pool churn evidence; never calls a database or provider.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const captureSchema = z.object({
  capturedAt: z.string().datetime(),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  pools: z.array(
    z.object({
      topic: z.object({ id: z.string(), name: z.string() }).passthrough(),
      candidates: z.array(
        z.object({ id: z.string(), triageEligible: z.boolean() }).passthrough(),
      ),
    }),
  ),
});

export function comparePools(beforeInput: unknown, afterInput: unknown) {
  const before = captureSchema.parse(beforeInput);
  const after = captureSchema.parse(afterInput);
  if (
    before.windowStart !== after.windowStart ||
    before.windowEnd !== after.windowEnd ||
    Date.parse(before.windowStart) >= Date.parse(before.windowEnd) ||
    Date.parse(before.capturedAt) >= Date.parse(after.capturedAt)
  )
    throw new Error(
      'Captures must be chronological and use the same valid window',
    );
  for (const capture of [before, after]) {
    if (
      new Set(capture.pools.map((p) => p.topic.id)).size !==
      capture.pools.length
    )
      throw new Error('Duplicate topic ID');
    for (const pool of capture.pools)
      if (
        new Set(pool.candidates.map((c) => c.id)).size !==
        pool.candidates.length
      )
        throw new Error('Duplicate candidate ID within topic');
  }
  const topicIds = new Set(
    [...before.pools, ...after.pools].map((p) => p.topic.id),
  );
  return {
    windowStart: before.windowStart,
    windowEnd: before.windowEnd,
    beforeAt: before.capturedAt,
    afterAt: after.capturedAt,
    evidence:
      'Observed eligible membership changes only. Not cache misses, scored-work waste, spend or latency. Final edition membership remains unobserved.',
    topics: [...topicIds].sort().map((id) => {
      const previous = before.pools.find((p) => p.topic.id === id);
      const current = after.pools.find((p) => p.topic.id === id);
      const oldIds = new Set(
        previous?.candidates.filter((c) => c.triageEligible).map((c) => c.id),
      );
      const newIds = new Set(
        current?.candidates.filter((c) => c.triageEligible).map((c) => c.id),
      );
      const lost = [...oldIds].filter((key) => !newIds.has(key));
      return {
        topicId: id,
        topic: current?.topic.name ?? previous!.topic.name,
        topicAdded: !previous,
        topicRemoved: !current,
        beforeEligible: oldIds.size,
        afterEligible: newIds.size,
        retainedEligible: [...oldIds].filter((key) => newIds.has(key)).length,
        addedEligible: [...newIds].filter((key) => !oldIds.has(key)).length,
        lostEligible: lost.length,
        lostAbsent: lost.filter(
          (key) => !current?.candidates.some((c) => c.id === key),
        ).length,
        lostIneligible: lost.filter((key) =>
          current?.candidates.some((c) => c.id === key),
        ).length,
        settingsChanged:
          !!previous &&
          !!current &&
          JSON.stringify(previous.topic) !== JSON.stringify(current.topic),
      };
    }),
  };
}

if (require.main === module) {
  try {
    const paths = process.argv.slice(2);
    if (paths.length !== 2)
      throw new Error('Expected BEFORE_CAPTURE AFTER_CAPTURE');
    console.log(
      JSON.stringify(
        comparePools(
          ...(paths.map((path) => JSON.parse(readFileSync(path, 'utf8'))) as [
            unknown,
            unknown,
          ]),
        ),
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Comparison failed');
    process.exitCode = 1;
  }
}
