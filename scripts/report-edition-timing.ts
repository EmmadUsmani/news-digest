// Read-only production evidence: GETs only, no jobs, inference or settings writes.
import { digestPreviewSchema, operationsStatusSchema } from '@digest/contracts';

async function read(path: string) {
  const response = await fetch(`http://localhost:8000${path}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Read failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

async function main() {
  const status = operationsStatusSchema.parse(await read('/api/status'));
  const queue = status.queues.find((q) => q.name === 'digest-generation');
  if (!queue?.available) throw new Error('Digest queue unavailable');
  const completed = queue.runs
    .filter((run) => run.state === 'completed' && run.editionId)
    .slice(0, 3);
  const runs = [];
  for (const run of completed) {
    const edition = digestPreviewSchema.parse(
      await read(`/api/digest-previews/${encodeURIComponent(run.editionId!)}`),
    );
    runs.push({
      jobId: run.id,
      editionId: edition.id,
      scheduledAt: run.scheduledAt,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      workerDurationMs: run.durationMs,
      attempts: run.attempts,
      editionCreatedAt: edition.createdAt,
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
      llmBudget: {
        todayMicros: status.llm.todayMicros,
        availableMicros: status.llm.availableMicros,
        todayReservedMicros: status.llm.todayReservedMicros,
        dailyCapMicros: status.llm.dailyCapMicros,
        blockedUntil: status.llm.blockedUntil,
      },
      pending: queue.runs
        .filter((run) => ['active', 'waiting', 'delayed'].includes(run.state))
        .map(({ id, state, scheduledAt }) => ({ id, state, scheduledAt })),
      runs,
    }),
  );
}

void main().catch(() => {
  console.error('Edition timing report unavailable');
  process.exitCode = 1;
});
