// Offline cache/scheduling experiment. No database, environment keys or HTTP.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { llmConfig } from '../src/modules/curation/adapters/config';
import {
  CandidateTriage,
  type TriageCandidate,
} from '../src/modules/curation/application/triage';

export interface RecordedWindow {
  topic: string;
  windowStart: string;
  windowEnd: string;
  candidates: (TriageCandidate & {
    publishedAt: string;
    availableAt?: string;
  })[];
  // Complete eligible pools at each observed time; the latest pool persists.
  poolSnapshots?: { at: string; candidateIds: string[] }[];
}

export async function evaluateIncrementalTriage(
  window: RecordedWindow,
  intervalHours: number,
  minimumPendingItems = 1,
) {
  if (
    !Number.isInteger(intervalHours) ||
    intervalHours < 1 ||
    intervalHours > 24
  )
    throw new Error('Interval must be 1–24 hours');
  if (!Number.isInteger(minimumPendingItems) || minimumPendingItems < 1)
    throw new Error('Minimum pending items must be a positive integer');
  const start = Date.parse(window.windowStart);
  const end = Date.parse(window.windowEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    throw new Error('Invalid window');
  if (
    new Set(window.candidates.map((c) => c.id)).size !==
      window.candidates.length ||
    window.candidates.some((c) => !Number.isFinite(Date.parse(c.publishedAt)))
  )
    throw new Error('Invalid candidates');
  const candidates = window.candidates.filter(
    (c) =>
      Date.parse(c.publishedAt) >= start && Date.parse(c.publishedAt) < end,
  );
  const snapshots = window.poolSnapshots;
  const arrivalMode = window.candidates.some(
    (c) => c.availableAt !== undefined,
  );
  if (
    arrivalMode &&
    window.candidates.some(
      (c) =>
        !c.availableAt ||
        !Number.isFinite(Date.parse(c.availableAt)) ||
        Date.parse(c.availableAt) < Date.parse(c.publishedAt),
    )
  )
    throw new Error('Invalid arrival times');
  const known = new Set(candidates.map((c) => c.id));
  if (
    snapshots &&
    (!snapshots.length ||
      snapshots.some((snapshot, index) => {
        const at = Date.parse(snapshot.at);
        return (
          !Number.isFinite(at) ||
          at < start ||
          at > end ||
          (index > 0 && at <= Date.parse(snapshots[index - 1].at)) ||
          new Set(snapshot.candidateIds).size !==
            snapshot.candidateIds.length ||
          snapshot.candidateIds.some((id) => !known.has(id))
        );
      }))
  )
    throw new Error('Invalid pool snapshots');
  const poolAt = (at: number) => {
    const snapshot = snapshots?.filter((s) => Date.parse(s.at) <= at).at(-1);
    const ids = snapshot ? new Set(snapshot.candidateIds) : undefined;
    return candidates.filter(
      (c) =>
        Date.parse(c.availableAt ?? c.publishedAt) < at &&
        (!snapshots || (ids?.has(c.id) ?? false)),
    );
  };
  const finalPool = poolAt(end);
  const preScoredIds = new Set<string>();
  const allScoredIds = new Set<string>();
  const cache = new Map<string, unknown>();
  let requests = 0;
  let scoredItems = 0;
  let promptBytes = 0;
  let reservedOutputTokens = 0;
  const triage = new CandidateTriage(
    {
      json(request, validate) {
        requests++;
        promptBytes += Buffer.byteLength(
          request.instructions + request.prompt,
          'utf8',
        );
        reservedOutputTokens += request.maxOutputTokens;
        const batch = (
          JSON.parse(request.prompt) as { candidates: TriageCandidate[] }
        ).candidates;
        scoredItems += batch.length;
        return Promise.resolve(
          validate({
            items: batch.map((c) => ({
              id: c.id,
              relevance: 5,
              importance: 5,
              event: 'Synthetic event',
              rationale: 'Cache experiment only',
            })),
          }),
        );
      },
      failureReason() {
        return null;
      },
    },
    {
      cached(key) {
        return Promise.resolve(cache.get(key));
      },
      cache(key, value) {
        cache.set(key, value);
        return Promise.resolve();
      },
    },
    llmConfig({}).haiku,
  );
  const topic = {
    id: window.topic,
    name: window.topic,
    description: '',
    guidance: '',
  };
  let deferredPasses = 0;
  // Publication time is an optimistic availability proxy: fixtures lack ingestion times.
  for (
    let tick = start + intervalHours * 3600000;
    tick < end;
    tick += intervalHours * 3600000
  ) {
    const pool = poolAt(tick);
    const pending = pool.filter((c) => !allScoredIds.has(c.id));
    if (pending.length < minimumPendingItems) {
      if (pending.length) deferredPasses++;
      continue;
    }
    pool.forEach((c) => {
      preScoredIds.add(c.id);
      allScoredIds.add(c.id);
    });
    const result = await triage.score(topic, pool, 'offline-incremental');
    if (result.unscoredIds.length)
      throw new Error('Incomplete incremental scoring');
  }
  const before = { requests, scoredItems };
  finalPool.forEach((c) => allScoredIds.add(c.id));
  const final = await triage.score(topic, finalPool, 'offline-edition');
  if (final.unscoredIds.length) throw new Error('Incomplete edition scoring');
  return {
    topic: window.topic,
    intervalHours,
    minimumPendingItems,
    deferredPasses,
    candidates: finalPool.length,
    availability: arrivalMode ? 'recorded-arrival' : 'publication-proxy',
    unavailableAtEdition: candidates.filter(
      (c) => Date.parse(c.availableAt ?? c.publishedAt) >= end,
    ).length,
    preEditionItems: before.scoredItems,
    preEditionRequests: before.requests,
    editionItems: scoredItems - before.scoredItems,
    editionRequests: requests - before.requests,
    totalRequests: requests,
    totalScoredItems: scoredItems,
    promptBytes,
    reservedOutputTokens,
    repeatScoring: scoredItems - allScoredIds.size,
    wasteItems: snapshots
      ? [...preScoredIds].filter((id) => !finalPool.some((c) => c.id === id))
          .length
      : null,
  };
}

export async function recordedIncrementalTriage(minimumPendingItems = 1) {
  const results = [];
  for (const topic of ['nba', 'world', 'tech']) {
    const window = JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/ranking-${topic}-2026-11-01.json`),
        'utf8',
      ),
    ) as RecordedWindow;
    for (const interval of [1, 3, 6, 24])
      results.push(
        await evaluateIncrementalTriage(window, interval, minimumPendingItems),
      );
  }
  return results;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const inputPath = args.find((arg) => !arg.startsWith('--'));
  const minimumPending = Number(
    args.find((arg) => arg.startsWith('--minimum-pending='))?.split('=')[1] ??
      1,
  );
  void (
    inputPath
      ? Promise.all(
          [1, 3, 6, 24].map((interval) =>
            evaluateIncrementalTriage(
              JSON.parse(readFileSync(inputPath, 'utf8')) as RecordedWindow,
              interval,
              minimumPending,
            ),
          ),
        )
      : recordedIncrementalTriage(minimumPending)
  ).then((results) =>
    console.log(
      JSON.stringify(
        {
          note: 'Synthetic scores over recorded article excerpts, including all in-window candidates. Publication time is an optimistic availability proxy, not ingestion evidence. No quality, cost or live latency measurement. Arrival times and complete pool snapshots are optional inputs; absent evidence uses publication proxies and leaves waste unknown. No production setting or activation.',
          results,
        },
        null,
        2,
      ),
    ),
  );
}
