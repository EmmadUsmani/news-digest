// Explicit once-only STEERING 36 verification; never imported by runtime/tests.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';

import { relevancePolicySchema } from '@digest/contracts';

import { eventGroupingEvaluationLedger } from '../apps/api/scripts/event-grouping-evaluation-ledger';
import { runEventGroupingEvaluationOnce } from '../apps/api/scripts/event-grouping-evaluation-once';
import { checkEvaluationStateDirectory } from '../apps/api/scripts/event-grouping-evaluation-state';
import { database } from '../apps/api/src/libs/db/connections';
import { AnthropicLlmAdapter } from '../apps/api/src/modules/curation/adapters/anthropic';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { llmFingerprint } from '../apps/api/src/modules/curation/application/llm-fingerprint';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import { configuredLlmLedger } from '../apps/api/src/modules/curation/public/ledger';
import { editorialShortlist } from '../apps/api/src/modules/digests/domain/editorial-shortlist';
import {
  type Candidate,
  rank,
} from '../apps/api/src/modules/digests/domain/rank';

const directory = '/home/exedev/.local/state/news-digest/item-36-world';
interface Window {
  editionId: string;
  topicId: string;
  windowStart: string;
  windowEnd: string;
  policy: unknown;
  candidates: Candidate[];
  scores: { id: string; relevance: number; importance: number }[];
}
async function main() {
  assert.deepEqual(process.argv.slice(2), ['--verify-once']);
  assert.equal(process.env.LLM_LIVE, '1');
  const key = process.env.ANTHROPIC_API_KEY;
  assert.ok(key);
  const fixture = JSON.parse(
    readFileSync(
      'apps/api/test/fixtures/world-story-pool-2026-11-04-05.json',
      'utf8',
    ),
  ) as { windows: Window[] };
  assert.equal(fixture.windows.length, 2);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await checkEvaluationStateDirectory(directory);
  const config = llmConfig();
  const runId = 'item-36-world-' + randomUUID();
  const db = database();
  try {
    const ledger = eventGroupingEvaluationLedger(
      configuredLlmLedger(db, config.caps, true),
      {
        live: process.env.LLM_LIVE,
        runId,
        modelId: config.haiku.id,
        capMicros: 50000,
      },
    );
    await db.query('SELECT 1');
    const llm = new BudgetedLlm(new AnthropicLlmAdapter(key), ledger);
    const records: { fingerprint: string; model: string; response: unknown }[] =
      [];
    const grouping = new EventGrouping(
      {
        async json<T>(
          request: LlmRequest,
          validate: (value: unknown) => T,
        ): Promise<T | null> {
          const result = await llm.json(request, validate, { repair: false });
          records.push({
            fingerprint: llmFingerprint(request),
            model: request.model.id,
            response: result,
          });
          return result;
        },
      },
      config.haiku,
    );
    // Reuse the tested exclusive, fsynced claim/report primitive in a separate
    // fixed directory. Its legacy filenames do not renew item-27 authorization.
    const report = await runEventGroupingEvaluationOnce(directory, async () => {
      const windows = [];
      for (const window of fixture.windows) {
        for (const size of [10, 40] as const) {
          const start = new Date(window.windowStart);
          const end = new Date(window.windowEnd);
          const { shortlist } = editorialShortlist(
            window.candidates,
            window.scores,
            relevancePolicySchema.parse(window.policy),
            start,
            end,
            undefined,
            size,
          );
          assert.equal(shortlist.length, size);
          const before = records.length;
          const groups = await grouping.group(
            window.topicId,
            shortlist.map((c) => ({
              ...c,
              topicId: window.topicId,
              outlet: c.sources.join(', '),
            })),
            runId,
          );
          const valid =
            records.length === before + 1 && records[before].response !== null;
          const membership = new Map(
            groups.flatMap((group, i) => group.map((id) => [id, i] as const)),
          );
          const matches = (a: Candidate, b: Candidate) =>
            membership.has(a.id) &&
            membership.get(a.id) === membership.get(b.id);
          windows.push({
            editionId: window.editionId,
            poolArticles: size,
            valid,
            groups,
            distinctStories: valid
              ? size - groups.reduce((n, g) => n + g.length - 1, 0)
              : null,
            editorCandidateIds: valid
              ? rank(shortlist, start, end, 10, matches).map((c) => c.id)
              : null,
          });
        }
      }
      return {
        runId,
        model: config.haiku.id,
        recordedAt: new Date().toISOString(),
        windows,
        records,
      };
    });
    console.log(JSON.stringify(report));
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Verification stopped; inspect durable item-36-world claim/report and ledger. Never delete the claim or retry paid calls.',
  );
  process.exitCode = 1;
});
