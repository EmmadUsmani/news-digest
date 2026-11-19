// Offline only: original editorial evidence must be supplied, never reconstructed from summaries.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { costMicros } from '../src/modules/curation/domain/budget';
import type {
  LlmRequest,
  ModelPrice,
} from '../src/modules/curation/domain/llm.port';
import { rewriteSelectedDevelopingStories } from '../src/modules/digests/application/rewrite-selected-developing-stories';

type RewriteInput = Parameters<typeof rewriteSelectedDevelopingStories>[0];
export type RewriteCaptureCase = Omit<
  RewriteInput,
  'llm' | 'model' | 'execution'
> & {
  editionId: string;
};

export async function prepareDevelopingRewriteRequests(
  cases: RewriteCaptureCase[],
  model: ModelPrice,
) {
  const results = [];
  for (const item of cases) {
    const captured: LlmRequest[] = [];
    await rewriteSelectedDevelopingStories({
      ...item,
      model,
      llm: {
        complete(request) {
          captured.push(structuredClone(request));
          // Refuse after capture: no generated prose or semantic acceptance.
          return Promise.resolve({
            text: 'null',
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          });
        },
      },
    });
    const request = captured[0] ?? null;
    const inputBound = request
      ? Buffer.byteLength(request.instructions + request.prompt, 'utf8') + 2048
      : null;
    const reserveMicros =
      request && inputBound !== null
        ? costMicros(
            {
              input: inputBound,
              output: request.maxOutputTokens,
              cacheRead: 0,
              cacheWrite: 0,
            },
            {
              ...model,
              input: Math.max(model.input, model.cacheWrite, model.cacheRead),
            },
          )
        : null;
    results.push({
      editionId: item.editionId,
      topicId: item.topicId,
      inputSha256: createHash('sha256')
        .update(JSON.stringify(item))
        .digest('hex'),
      status: request ? 'request-ready' : 'unavailable',
      inputBound,
      reserveMicros,
      request,
    });
  }
  return {
    purpose:
      'Offline rewrite request capture; supplied evidence provenance requires review. No provider calls, semantic results, ledger reservation or whole-edition admission.',
    cases: results,
    requestCount: results.filter((item) => item.request).length,
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
      'Usage: tsx apps/api/scripts/prepare-developing-rewrite-requests.ts inputs.json output.json',
    );
  const fixture = JSON.parse(readFileSync(input, 'utf8')) as {
    cases: RewriteCaptureCase[];
  };
  const report = await prepareDevelopingRewriteRequests(
    fixture.cases,
    llmConfig().sonnet,
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
      reserveMicros: report.totalReserveMicros,
    }),
  );
}
if (require.main === module)
  void main().catch(() => {
    console.error('Offline rewrite request capture failed');
    process.exitCode = 1;
  });
