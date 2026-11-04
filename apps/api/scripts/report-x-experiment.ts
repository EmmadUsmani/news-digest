// Offline only: reads saved evidence, never imports the application or providers.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { xExperimentReport } from '../../../scripts/lib/x-experiment-report';

const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const evidenceSchema = z.array(
  z
    .object({
      requestId: z.string().min(1),
      topicId: z.string().min(1),
      model: z.string().min(1),
      style: z.enum(['current', 'trending', 'reactions']),
      window: z.object({ start: z.string(), end: z.string() }).strict(),
      costMicros: count,
      postsFetched: count,
      actualToolCalls: z.array(z.unknown()),
      expectedSearch: z
        .object({
          minFaves: count,
          exclusions: z.array(z.string().regex(/^-[a-zA-Z0-9_]+$/)),
        })
        .strict()
        .optional(),
      posts: z.array(
        z
          .object({
            id: z.string().regex(/^\d+$/),
            publishedAt: z.string().nullable(),
            likes: count.nullable(),
            relevance: z.number().min(0).max(10).nullable(),
            promotion: z.boolean().nullable(),
          })
          .strict(),
      ),
    })
    .strict(),
);

export function reportSavedXExperiment(input: unknown) {
  return {
    note: 'Saved evidence only; no provider calls, production ingestion or winner selection. Missing labels remain unknown. Tool inputs do not prove X honored operators.',
    calls: xExperimentReport(evidenceSchema.parse(input)),
  };
}

if (require.main === module) {
  try {
    if (process.argv.length !== 3) throw new Error('Expected one input path');
    const report = reportSavedXExperiment(
      JSON.parse(readFileSync(process.argv[2], 'utf8')),
    );
    console.log(JSON.stringify(report));
  } catch {
    // Never echo saved provider bodies, paths or unvalidated input on failure.
    console.error(
      'X experiment report failed: supply one valid saved-evidence JSON array path',
    );
    process.exitCode = 1;
  }
}
