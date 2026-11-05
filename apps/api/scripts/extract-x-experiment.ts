// Offline only; the manifest lists settled calls. Unknown holds stay in the journal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { xExperimentReport } from '../../../scripts/lib/x-experiment-report';
import { extractXExperimentResponse } from './lib/x-experiment-extract';

const read = (directory: string, name: string): unknown =>
  JSON.parse(readFileSync(join(directory, name), 'utf8'));
const count = z.number().int().nonnegative().safe();
const roundSchema = z.object({
  calls: z.array(
    z.object({
      requestId: z.string().regex(/^[a-zA-Z0-9_-]+$/),
      costMicros: count,
    }),
  ),
});
const requestSchema = z.object({
  requestId: z.string(),
  topicId: z.string(),
  style: z.enum(['current', 'trending', 'reactions', 'viral', 'semantic']),
  window: z.object({ start: z.string(), end: z.string() }),
  body: z.object({ model: z.string() }),
});
const inputsSchema = z.object({
  topics: z.array(
    z.object({
      topicId: z.string(),
      settings: z.object({
        reactionMinFaves: count.optional(),
        trendingMinFaves: count,
        exclusions: z.array(z.string()),
      }),
    }),
  ),
});

try {
  if (process.argv.length !== 3)
    throw new Error('Expected saved round directory');
  const directory = process.argv[2];
  const round = roundSchema.parse(read(directory, 'round.json'));
  const inputs = inputsSchema.parse(read(directory, 'inputs.json'));
  const evidence = round.calls.map((call) => {
    const request = requestSchema.parse(
      read(directory, `${call.requestId}.request.json`),
    );
    if (request.requestId !== call.requestId)
      throw new Error('Request mismatch');
    const settings = inputs.topics.find(
      (topic) => topic.topicId === request.topicId,
    )?.settings;
    if (!settings) throw new Error('Missing settings');
    if (
      request.style === 'reactions' &&
      settings.reactionMinFaves === undefined
    )
      throw new Error('Missing historical reaction threshold');
    const response = z
      .object({ status: z.number().min(200).max(299), raw: z.string() })
      .parse(read(directory, `${call.requestId}.response.json`));
    const settled = z
      .object({ costMicros: count })
      .parse(read(directory, `${call.requestId}.settled.json`));
    if (settled.costMicros !== call.costMicros)
      throw new Error('Settlement mismatch');
    return extractXExperimentResponse(
      {
        requestId: request.requestId,
        topicId: request.topicId,
        style: request.style,
        model: request.body.model,
        window: request.window,
        costMicros: call.costMicros,
        ...(request.style === 'current'
          ? {}
          : {
              expectedSearch: {
                minFaves:
                  request.style === 'reactions'
                    ? settings.reactionMinFaves!
                    : settings.trendingMinFaves,
                exclusions: settings.exclusions,
              },
            }),
      },
      response.raw,
    );
  });
  xExperimentReport(evidence);
  process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
} catch {
  console.error(
    'Cannot extract saved experiment; input invalid or incomplete. No evidence written.',
  );
  process.exitCode = 1;
}
