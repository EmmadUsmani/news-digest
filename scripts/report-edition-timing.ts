// Read-only production evidence: GETs and ledger SELECTs; no jobs or inference.
import { digestPreviewSchema, operationsStatusSchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { readEditionCost } from '../apps/api/src/modules/curation/database/edition-cost.reader';
import { scheduledTiming, timingEvidence } from './lib/scheduled-timing';

async function read(path: string) {
  const response = await fetch(`http://localhost:8000${path}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Read failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function main() {
  const db = database();
  try {
    const status = operationsStatusSchema.parse(await read('/api/status'));
    const queue = status.queues.find((q) => q.name === 'digest-generation');
    if (!queue?.available) throw new Error('Digest queue unavailable');
    const evidence = timingEvidence(queue.runs);
    const runs = [];
    for (const run of evidence.completed) {
      const edition = digestPreviewSchema.parse(
        await read(
          `/api/digest-previews/${encodeURIComponent(run.editionId!)}`,
        ),
      );
      runs.push({
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
          postEditorial: topic.postEditorial
            ? {
                mode: topic.postEditorial.mode,
                model: topic.postEditorial.model,
                reason: topic.postEditorial.reason,
              }
            : null,
        })),
      });
    }
    console.log(
      JSON.stringify({
        checkedAt: status.checkedAt,
        note: 'Retained live jobs only; duration covers the final worker attempt, excludes queue wait, and may reuse an existing edition or cached scores. AI mode does not prove fresh provider calls. Fallback/cache timings do not establish cold live AI latency targets. No inference or publication triggered.',
        nextRun: queue.nextRun,
        latestScheduled: evidence.latestScheduled,
        latestScheduledOutcome: evidence.latestScheduledOutcome,
        failed: evidence.failed,
        retentionNote:
          'Latest scheduled job is selected by intended schedule within retained status jobs, regardless of state. Latest settled scheduled outcome is shown separately and its completed edition is included even after three newer manual jobs. Failed jobs have no inferred edition cost or failure reason; inspect retained logs. Missing scheduled evidence does not prove no run occurred.',
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
        runs,
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
