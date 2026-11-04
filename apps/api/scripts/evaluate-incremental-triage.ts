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
  poolSnapshots?: {
    at: string;
    candidateIds: string[];
    // Changed scoring inputs take effect at this observation and persist.
    candidateUpdates?: TriageCandidate[];
  }[];
}

export async function evaluateIncrementalTriage(
  window: RecordedWindow,
  intervalHours: number,
  minimumPendingItems = 1,
  stopBeforeEditionHours = 0,
  maximumItemsPerPass?: number,
  rotation?: { topicCount: number; topicIndex: number },
) {
  if (
    !Number.isInteger(intervalHours) ||
    intervalHours < 1 ||
    intervalHours > 24
  )
    throw new Error('Interval must be 1–24 hours');
  if (!Number.isInteger(minimumPendingItems) || minimumPendingItems < 1)
    throw new Error('Minimum pending items must be a positive integer');
  if (
    !Number.isFinite(stopBeforeEditionHours) ||
    stopBeforeEditionHours < 0 ||
    stopBeforeEditionHours > 24
  )
    throw new Error('Pretriage cutoff must be 0–24 hours');
  if (
    maximumItemsPerPass !== undefined &&
    (!Number.isInteger(maximumItemsPerPass) || maximumItemsPerPass < 1)
  )
    throw new Error('Maximum items per pass must be a positive integer');
  if (
    rotation &&
    (!Number.isSafeInteger(rotation.topicCount) ||
      rotation.topicCount < 1 ||
      !Number.isSafeInteger(rotation.topicIndex) ||
      rotation.topicIndex < 0 ||
      rotation.topicIndex >= rotation.topicCount)
  )
    throw new Error('Invalid topic rotation');
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
          snapshot.candidateIds.some((id) => !known.has(id)) ||
          (snapshot.candidateUpdates !== undefined &&
            (!Array.isArray(snapshot.candidateUpdates) ||
              new Set(snapshot.candidateUpdates.map((c) => c.id)).size !==
                snapshot.candidateUpdates.length ||
              snapshot.candidateUpdates.some(
                (c) =>
                  !known.has(c.id) ||
                  typeof c.title !== 'string' ||
                  (c.excerpt !== null && typeof c.excerpt !== 'string') ||
                  !Array.isArray(c.sources) ||
                  c.sources.some((source) => typeof source !== 'string'),
              )))
        );
      }))
  )
    throw new Error('Invalid pool snapshots');
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const poolAt = (at: number) => {
    const observed = snapshots?.filter((s) => Date.parse(s.at) <= at);
    const snapshot = observed?.at(-1);
    const versions = new Map(byId);
    for (const observation of observed ?? [])
      for (const update of observation.candidateUpdates ?? [])
        versions.set(update.id, {
          ...versions.get(update.id)!,
          title: update.title,
          excerpt: update.excerpt,
          sources: update.sources,
        });
    // Snapshot order is the shared pool's ranking order. A bounded pass must
    // consume that order, not the order of the exported candidate catalogue.
    const pool = snapshots
      ? (snapshot?.candidateIds ?? []).map((id) => versions.get(id)!)
      : candidates;
    return pool.filter((c) => Date.parse(c.availableAt ?? c.publishedAt) < at);
  };
  const finalPool = poolAt(end);
  const preScoredIds = new Set<string>();
  const allScoredIds = new Set<string>();
  const preScoredVersions = new Map<string, number>();
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
  // Match the application entry point's 200-candidate bound without dropping
  // any candidates. Item cache keys remain independent of chunk membership.
  const scorePool = async (pool: TriageCandidate[], runId: string) => {
    for (let offset = 0; offset < pool.length; offset += 200) {
      const result = await triage.score(
        topic,
        pool.slice(offset, offset + 200),
        runId,
      );
      if (result.unscoredIds.length) throw new Error('Incomplete scoring');
    }
  };
  const pendingPool = async (pool: TriageCandidate[]) => {
    const pending: TriageCandidate[] = [];
    for (let offset = 0; offset < pool.length; offset += 200)
      pending.push(
        ...(await triage.pending(topic, pool.slice(offset, offset + 200))),
      );
    return pending;
  };
  const passes: {
    at: string;
    phase: 'background' | 'edition';
    outcome: 'scored' | 'cached' | 'threshold' | 'rotation' | 'cutoff';
    poolItems: number;
    pendingItems: number;
    scoredItems: number;
    requests: number;
  }[] = [];
  let scheduledPasses = 0;
  let deferredPasses = 0;
  let boundedPasses = 0;
  let peakPendingItems = 0;
  // Publication time is an optimistic availability proxy: fixtures lack ingestion times.
  for (
    let tick = start + intervalHours * 3600000;
    tick < end;
    tick += intervalHours * 3600000
  ) {
    const tickIndex =
      Math.round((tick - start) / (intervalHours * 3600000)) - 1;
    const pool = poolAt(tick);
    const pending = await pendingPool(pool);
    const pass = {
      at: new Date(tick).toISOString(),
      phase: 'background' as const,
      outcome: 'scored' as (typeof passes)[number]['outcome'],
      poolItems: pool.length,
      pendingItems: pending.length,
      scoredItems: 0,
      requests: 0,
    };
    passes.push(pass);
    // Cutoff takes precedence: no background topic may run in this period.
    if (tick >= end - stopBeforeEditionHours * 3600000) {
      pass.outcome = 'cutoff';
      continue;
    }
    if (rotation && tickIndex % rotation.topicCount !== rotation.topicIndex) {
      pass.outcome = 'rotation';
      continue;
    }
    scheduledPasses++;
    peakPendingItems = Math.max(peakPendingItems, pending.length);
    if (pending.length < minimumPendingItems) {
      if (pending.length) deferredPasses++;
      pass.outcome = pending.length ? 'threshold' : 'cached';
      continue;
    }
    const selected =
      maximumItemsPerPass === undefined
        ? pool
        : pending.slice(0, maximumItemsPerPass);
    if (maximumItemsPerPass !== undefined && pending.length > selected.length)
      boundedPasses++;
    selected.forEach((c) => {
      preScoredIds.add(c.id);
      allScoredIds.add(c.id);
    });
    for (const candidate of await pendingPool(selected))
      preScoredVersions.set(
        candidate.id,
        (preScoredVersions.get(candidate.id) ?? 0) + 1,
      );
    const beforePass = { requests, scoredItems };
    await scorePool(selected, 'offline-incremental');
    pass.requests = requests - beforePass.requests;
    pass.scoredItems = scoredItems - beforePass.scoredItems;
  }
  const before = { requests, scoredItems };
  const finalPending = await pendingPool(finalPool);
  const reusablePreEditionVersions = finalPool.length - finalPending.length;
  const finalIds = new Set(finalPool.map((c) => c.id));
  const removedPreEditionVersions = [...preScoredVersions].reduce(
    (total, [id, count]) => total + (finalIds.has(id) ? 0 : count),
    0,
  );
  const invalidatedPreEditionItems = finalPending.filter((c) =>
    preScoredIds.has(c.id),
  ).length;
  finalPool.forEach((c) => allScoredIds.add(c.id));
  await scorePool(finalPool, 'offline-edition');
  passes.push({
    at: new Date(end).toISOString(),
    phase: 'edition',
    outcome: finalPending.length ? 'scored' : 'cached',
    poolItems: finalPool.length,
    pendingItems: finalPending.length,
    requests: requests - before.requests,
    scoredItems: scoredItems - before.scoredItems,
  });
  return {
    topic: window.topic,
    passes,
    intervalHours,
    rotation: rotation ?? null,
    scheduledPasses,
    minimumPendingItems,
    stopBeforeEditionHours,
    maximumItemsPerPass: maximumItemsPerPass ?? null,
    boundedPasses,
    peakPendingItems,
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
    invalidatedPreEditionItems,
    // Version counts describe synthetic scoring work, never provider dollars.
    reusablePreEditionVersions: snapshots ? reusablePreEditionVersions : null,
    removedPreEditionVersions: snapshots ? removedPreEditionVersions : null,
    obsoletePreEditionVersions: snapshots
      ? before.scoredItems -
        removedPreEditionVersions -
        reusablePreEditionVersions
      : null,
    wastedPreEditionVersions: snapshots
      ? before.scoredItems - reusablePreEditionVersions
      : null,
    wasteItems: snapshots
      ? [...preScoredIds].filter((id) => !finalPool.some((c) => c.id === id))
          .length
      : null,
  };
}

export async function recordedIncrementalTriage(
  minimumPendingItems = 1,
  stopBeforeEditionHours = 0,
  maximumItemsPerPass?: number,
  rotationTopics = 1,
) {
  if (
    !Number.isSafeInteger(rotationTopics) ||
    rotationTopics < 1 ||
    rotationTopics > 24
  )
    throw new Error('Rotation topics must be 1–24');
  const results = [];
  for (const topic of ['nba', 'world', 'tech']) {
    const window = JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/ranking-${topic}-2026-11-01.json`),
        'utf8',
      ),
    ) as RecordedWindow;
    for (const interval of [1, 3, 6, 24])
      for (let topicIndex = 0; topicIndex < rotationTopics; topicIndex++)
        results.push(
          await evaluateIncrementalTriage(
            window,
            interval,
            minimumPendingItems,
            stopBeforeEditionHours,
            maximumItemsPerPass,
            rotationTopics > 1
              ? { topicCount: rotationTopics, topicIndex }
              : undefined,
          ),
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
  const stopBeforeEdition = Number(
    args
      .find((arg) => arg.startsWith('--stop-before-edition-hours='))
      ?.split('=')[1] ?? 0,
  );
  const maximumItemsPerPassArg = args.find((arg) =>
    arg.startsWith('--maximum-items-per-pass='),
  );
  const maximumItemsPerPass = maximumItemsPerPassArg
    ? Number(maximumItemsPerPassArg.split('=')[1])
    : undefined;
  const rotationTopics = Number(
    args.find((arg) => arg.startsWith('--rotation-topics='))?.split('=')[1] ??
      1,
  );
  if (inputPath && rotationTopics !== 1)
    throw new Error(
      'Rotation comparison uses the recorded windows; omit input path',
    );
  void (
    inputPath
      ? Promise.all(
          [1, 3, 6, 24].map((interval) =>
            evaluateIncrementalTriage(
              JSON.parse(readFileSync(inputPath, 'utf8')) as RecordedWindow,
              interval,
              minimumPending,
              stopBeforeEdition,
              maximumItemsPerPass,
            ),
          ),
        )
      : recordedIncrementalTriage(
          minimumPending,
          stopBeforeEdition,
          maximumItemsPerPass,
          rotationTopics,
        )
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
