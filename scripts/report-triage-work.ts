// Offline evidence join only. Inputs must come from observed scoring and the
// final eligible triage pool, not prospective captures or selected stories.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const identity = z.object({
  topicId: z.string().min(1),
  articleId: z.string().min(1),
  fingerprint: z.string().min(1),
});
const schema = z.object({
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  finalPoolObservedAt: z.string().datetime(),
  finalPool: z.array(identity),
  attempts: z.array(
    identity.extend({
      attemptId: z.string().min(1),
      completedAt: z.string().datetime(),
      outcome: z.enum(['scored', 'unscored']),
    }),
  ),
});
const key = (row: z.infer<typeof identity>) =>
  JSON.stringify([row.topicId, row.articleId]);

export function reportTriageWork(input: unknown) {
  const data = schema.parse(input);
  const start = Date.parse(data.windowStart);
  const end = Date.parse(data.windowEnd);
  if (start >= end || Date.parse(data.finalPoolObservedAt) < end)
    throw new Error(
      'Final pool must be observed at or after a valid window end',
    );
  const final = new Map(
    data.finalPool.map((row) => [key(row), row.fingerprint]),
  );
  if (final.size !== data.finalPool.length)
    throw new Error('Duplicate final pool article');
  const attempts = new Set<string>();
  for (const row of data.attempts) {
    const at = Date.parse(row.completedAt);
    if (at < start || at >= end)
      throw new Error('Scoring must complete within the background window');
    const attemptKey = JSON.stringify([row.attemptId, key(row)]);
    if (attempts.has(attemptKey)) throw new Error('Duplicate scoring evidence');
    attempts.add(attemptKey);
  }
  const summarize = (
    pool: typeof data.finalPool,
    work: typeof data.attempts,
  ) => {
    const final = new Map(pool.map((row) => [key(row), row.fingerprint]));
    const successful = work.filter((row) => row.outcome === 'scored');
    const reusable = successful.filter(
      (row) => final.get(key(row)) === row.fingerprint,
    );
    const absent = successful.filter((row) => !final.has(key(row)));
    const changed = successful.filter(
      (row) => final.has(key(row)) && final.get(key(row)) !== row.fingerprint,
    );
    const reusableArticles = new Set(reusable.map(key));
    return {
      attempts: work.length,
      unscoredAttempts: work.length - successful.length,
      successfulScorings: successful.length,
      reusableScorings: reusable.length,
      reusableArticles: reusableArticles.size,
      repeatedReusableScorings: reusable.length - reusableArticles.size,
      absentFromFinalPool: absent.length,
      changedFingerprint: changed.length,
      unusableScorings: absent.length + changed.length,
      finalPoolItems: final.size,
      finalPoolWithoutReusableScore: final.size - reusableArticles.size,
    };
  };
  const topicIds = [
    ...new Set([
      ...data.finalPool.map((row) => row.topicId),
      ...data.attempts.map((row) => row.topicId),
    ]),
  ].sort();
  return {
    windowStart: data.windowStart,
    windowEnd: data.windowEnd,
    evidence:
      'Observed successful scoring versus final eligible fingerprints. Compatibility is not proof of cache consumption. No cost or latency attribution; unscored attempts may still incur spend.',
    ...summarize(data.finalPool, data.attempts),
    topics: topicIds.map((topicId) => ({
      topicId,
      ...summarize(
        data.finalPool.filter((row) => row.topicId === topicId),
        data.attempts.filter((row) => row.topicId === topicId),
      ),
    })),
  };
}

if (require.main === module) {
  try {
    if (process.argv.length !== 3)
      throw new Error('Expected SCORING_EVIDENCE_JSON');
    console.log(
      JSON.stringify(
        reportTriageWork(JSON.parse(readFileSync(process.argv[2], 'utf8'))),
      ),
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Scoring evidence failed',
    );
    process.exitCode = 1;
  }
}
