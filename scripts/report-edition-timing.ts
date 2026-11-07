// Read-only production evidence: GETs and ledger SELECTs; no jobs or inference.
import { digestPreviewSchema, operationsStatusSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { readEditionCost } from '../apps/api/src/modules/curation/database/edition-cost.reader';
import { localAdminFetch } from './lib/local-admin-fetch';
import {
  collectTimingEvidence,
  scheduledTiming,
  selectedPostEvidence,
  timingEvidence,
  timingOptions,
} from './lib/scheduled-timing';

async function read(path: string) {
  const response = await localAdminFetch(`http://127.0.0.1:8000${path}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Read failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function main() {
  const options = timingOptions(process.argv.slice(2));
  const db = database();
  try {
    const status = operationsStatusSchema.parse(
      await read('/api/admin/status'),
    );
    const queue = status.queues.find((q) => q.name === 'digest-generation');
    if (!queue?.available) throw new Error('Digest queue unavailable');
    const evidence = timingEvidence(queue.runs, options);
    const collected = await collectTimingEvidence(
      evidence.completed,
      async (run) => {
        const edition = digestPreviewSchema.parse(
          await read(
            `/api/admin/digest-previews/${encodeURIComponent(run.editionId!)}`,
          ),
        );
        return {
          jobId: run.id,
          editionId: edition.id,
          scheduledAt: run.scheduledAt,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          workerDurationMs: run.durationMs,
          ...scheduledTiming(run),
          attempts: run.attempts,
          editionCreatedAt: edition.createdAt,
          providerLedger: await readEditionCost(db, edition.id),
          method: edition.method,
          windowStart: edition.windowStart,
          windowEnd: edition.windowEnd,
          topics: edition.topics.map((topic) => ({
            name: topic.name,
            candidateCount: topic.candidateCount,
            storyEditorial: topic.editorial
              ? {
                  mode: topic.editorial.mode,
                  model: topic.editorial.model,
                  reason: topic.editorial.reason,
                  unscored: topic.editorial.unscoredIds.length,
                }
              : null,
            postCount: topic.posts?.length ?? 0,
            postEvidence: selectedPostEvidence(topic.posts),
            blueskySelection: topic.blueskySelection ?? null,
            postEditorial: topic.postEditorial
              ? {
                  mode: topic.postEditorial.mode,
                  model: topic.postEditorial.model,
                  reason: topic.postEditorial.reason,
                }
              : null,
          })),
        };
      },
    );
    if (!collected.complete) process.exitCode = 1;
    console.log(
      JSON.stringify({
        checkedAt: status.checkedAt,
        selection: {
          ...options,
          retainedJobs: queue.runs.length,
          selectedCompletedJobs: evidence.completed.length,
          selectedFailedJobs: evidence.failed.length,
        },
        note: 'Retained live jobs only; duration covers the final worker attempt, excludes queue wait, and may reuse an existing edition or cached scores. AI mode does not prove fresh provider calls. Fallback/cache timings do not establish cold live AI latency targets. No inference or publication triggered.',
        nextRun: queue.nextRun,
        latestScheduled: evidence.latestScheduled,
        latestScheduledOutcome: evidence.latestScheduledOutcome,
        failed: evidence.failed,
        retentionNote:
          'Latest scheduled job is selected by intended schedule within retained status jobs, regardless of state. Latest settled scheduled outcome is shown separately and its completed edition is included even after the requested number of newer manual jobs. --limit bounds completed and failed lists separately (default 3, maximum 20); preserving the latest settled scheduled completion can add one completed run. --scheduled-only excludes manual jobs from those lists and orders by intended schedule. Limits apply before edition/ledger reads, not to queue retention. Failed jobs have no inferred edition cost or failure reason; inspect retained logs. Missing scheduled evidence does not prove no run occurred.',
        scheduleTimingNote:
          'Signed milliseconds from intended scheduled time to final-attempt start/completion; positive means later. Includes scheduling delay and prior retries, not pure queue wait. Manual runs or missing timestamps are null. Edition reuse is not a fresh publication measurement.',
        llmBudget: {
          todayMicros: status.llm.todayMicros,
          availableMicros: status.llm.availableMicros,
          todayReservedMicros: status.llm.todayReservedMicros,
          dailyCapMicros: status.llm.dailyCapMicros,
          blockedUntil: status.llm.blockedUntil,
        },
        scheduledReserve: status.llm.scheduledReserve ?? null,
        pending: queue.runs
          .filter((run) => ['active', 'waiting', 'delayed'].includes(run.state))
          .map(({ id, state, scheduledAt }) => ({ id, state, scheduledAt })),
        costNote:
          'Microdollars attributed by edition UUID, not time overlap. Successful calls are settled cost; pending/uncertain calls retain holds. Cache hits have no new call. Failed unpublished attempts have different UUIDs and are excluded; this is not total scheduled retry spend.',
        postEvidenceNote:
          'Platform counts and selected links come from immutable editions, not current discovery inventory. Missing historical posts are null; an explicit empty selection has zero counts. Engagement is the saved snapshot, not current or independently verified virality. Missing metrics and observation times remain unknown. Selection does not prove which search discovered a post or outside-list yield.',
        evidenceComplete: collected.complete,
        unavailable: collected.unavailable.map((run) => ({
          ...run,
          ...scheduledTiming(run),
          reason:
            'Edition or ledger read unavailable; no cost or content inferred.',
        })),
        partialEvidenceNote:
          'A failed edition or ledger read preserves other runs and the unavailable job timing. Partial evidence exits nonzero; unavailable is not a failed digest or proof of deletion. Status/queue read failures still stop the report.',
        runs: collected.runs,
      }),
    );
  } finally {
    await db.end();
  }
}

void main().catch(() => {
  console.error('Edition timing report unavailable');
  process.exitCode = 1;
});
