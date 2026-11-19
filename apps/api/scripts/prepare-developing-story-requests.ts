// Offline only: capture the real grouping adapter request without a provider or DB.
import { readFileSync, writeFileSync } from 'node:fs';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import { costMicros } from '../src/modules/curation/domain/budget';
import type {
  LlmRequest,
  ModelPrice,
} from '../src/modules/curation/domain/llm.port';
import { matchDevelopingStories } from '../src/modules/digests/application/match-developing-stories';
import { developingEvidence } from '../src/modules/digests/domain/developing-links';
import {
  type ReplayCase,
  replayFingerprint,
} from './evaluate-developing-stories';

export async function prepareDevelopingRequests(
  cases: ReplayCase[],
  model: ModelPrice,
) {
  const results = [];
  for (const item of cases) {
    let request: LlmRequest | null = null;
    const grouping = new EventGrouping(
      {
        json<T>(
          input: LlmRequest,
          _validate: (value: unknown) => T,
        ): Promise<T | null> {
          request = structuredClone(input);
          return Promise.resolve(null);
        },
      },
      model,
    );
    await matchDevelopingStories(
      grouping,
      {
        topicId: item.topicId,
        publishedAt: item.windowEnd,
        runId: 'offline-request-capture',
      },
      item.stories,
      item.history,
    );
    const captured = request as LlmRequest | null;
    const inputBound = captured
      ? Buffer.byteLength(captured.instructions + captured.prompt, 'utf8') +
        2048
      : null;
    const reserveMicros =
      captured && inputBound !== null
        ? costMicros(
            {
              input: inputBound,
              cacheWrite: 0,
              cacheRead: 0,
              output: captured.maxOutputTokens,
            },
            {
              ...model,
              input: Math.max(model.input, model.cacheWrite, model.cacheRead),
            },
          )
        : null;
    const historicalOccurrences = item.history.reduce(
      (sum, edition) => sum + edition.stories.length,
      0,
    );
    results.push({
      editionId: item.editionId,
      topicId: item.topicId,
      windowEnd: item.windowEnd,
      inputSha256: replayFingerprint(item),
      occurrences: developingEvidence(item.stories, item.history).length,
      // Capacity scenarios, not reconstructed production pools or paid admission.
      capacity: {
        historicalOccurrences,
        maximumCurrentStories: Math.max(0, 40 - historicalOccurrences),
        scenarios: [5, 10, 20, 40].map((currentStories) => ({
          currentStories,
          fitsOccurrenceLimit: currentStories + historicalOccurrences <= 40,
        })),
      },
      status: captured ? 'request-ready' : 'unavailable',
      unavailableReason: captured
        ? null
        : !item.stories.length
          ? 'no-current-stories'
          : !item.history.some((edition) => edition.stories.length)
            ? 'no-historical-stories'
            : developingEvidence(item.stories, item.history).length > 40
              ? 'occurrence-limit'
              : 'adapter-refused',
      inputBound,
      reserveMicros,
      request: captured,
    });
  }
  return {
    purpose:
      'Offline request capture only; no provider calls or semantic results. Reservation bounds are not actual spend or admission.',
    model,
    cases: results,
    requestCount: results.filter((item) => item.request !== null).length,
    totalReserveMicros: results.reduce(
      (sum, item) => sum + (item.reserveMicros ?? 0),
      0,
    ),
  };
}

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output || process.argv.length !== 4)
    throw new Error(
      'Usage: tsx apps/api/scripts/prepare-developing-story-requests.ts inputs.json output.json',
    );
  const fixture = JSON.parse(readFileSync(input, 'utf8')) as {
    cases: ReplayCase[];
  };
  const report = await prepareDevelopingRequests(
    fixture.cases,
    llmConfig().haiku,
  );
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n', {
    flag: 'wx',
    mode: 0o600,
  });
  console.log(
    JSON.stringify({
      output,
      cases: report.cases.length,
      requests: report.requestCount,
      unavailable: report.cases.filter((item) => !item.request).length,
      totalReserveMicros: report.totalReserveMicros,
    }),
  );
}
if (require.main === module)
  void main().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Request preparation failed',
    );
    process.exitCode = 1;
  });
