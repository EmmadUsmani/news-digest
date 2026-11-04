// Offline only: join private final-pool capture and exported scoring records.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { triageFingerprints } from './compare-triage-cache';
import { reportTriageWork } from './report-triage-work';

const captureSchema = z.object({
  capturedAt: z.string().datetime(),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
});
const exportSchema = z.object({ attempts: z.array(z.unknown()) });

export async function reportCapturedTriageWork(
  capture: unknown,
  model: string,
  exports: unknown[],
) {
  const metadata = captureSchema.parse(capture);
  // Validate final observation before deriving keys. An early pool is never
  // silently substituted for the publication-time eligible pool.
  reportTriageWork({
    ...metadata,
    finalPoolObservedAt: metadata.capturedAt,
    finalPool: [],
    attempts: [],
  });
  const keys = await triageFingerprints(capture, model);
  return {
    model,
    ...reportTriageWork({
      ...metadata,
      finalPoolObservedAt: metadata.capturedAt,
      finalPool: [...keys].flatMap(([topicId, articles]) =>
        [...articles].map(([articleId, fingerprint]) => ({
          topicId,
          articleId,
          fingerprint,
        })),
      ),
      attempts: exports.flatMap((data) => exportSchema.parse(data).attempts),
    }),
  };
}

if (require.main === module) {
  void (async () => {
    const [capture, model, ...files] = process.argv.slice(2);
    if (!capture || !model || !files.length)
      throw new Error('Expected FINAL_CAPTURE TRIAGE_MODEL_ID SCORE_EXPORT...');
    const read = (file: string): unknown =>
      JSON.parse(readFileSync(file, 'utf8'));
    console.log(
      JSON.stringify(
        await reportCapturedTriageWork(read(capture), model, files.map(read)),
      ),
    );
  })().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Evidence join failed',
    );
    process.exitCode = 1;
  });
}
