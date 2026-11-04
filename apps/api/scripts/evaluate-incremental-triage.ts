// Offline cache/scheduling experiment. No database, environment keys or HTTP.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { llmConfig } from '../src/modules/curation/adapters/config';
import {
  CandidateTriage,
  type TriageCandidate,
} from '../src/modules/curation/application/triage';

interface RecordedWindow {
  topic: string;
  windowStart: string;
  windowEnd: string;
  candidates: (TriageCandidate & { publishedAt: string })[];
}

export async function evaluateIncrementalTriage(
  window: RecordedWindow,
  intervalHours: number,
) {
  if (
    !Number.isInteger(intervalHours) ||
    intervalHours < 1 ||
    intervalHours > 24
  )
    throw new Error('Interval must be 1–24 hours');
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
  // Publication time is an optimistic availability proxy: fixtures lack ingestion times.
  for (
    let tick = start + intervalHours * 3600000;
    tick < end;
    tick += intervalHours * 3600000
  ) {
    const result = await triage.score(
      topic,
      candidates.filter((c) => Date.parse(c.publishedAt) < tick),
      'offline-incremental',
    );
    if (result.unscoredIds.length)
      throw new Error('Incomplete incremental scoring');
  }
  const before = { requests, scoredItems };
  const final = await triage.score(topic, candidates, 'offline-edition');
  if (final.unscoredIds.length) throw new Error('Incomplete edition scoring');
  return {
    topic: window.topic,
    intervalHours,
    candidates: candidates.length,
    preEditionItems: before.scoredItems,
    preEditionRequests: before.requests,
    editionItems: scoredItems - before.scoredItems,
    editionRequests: requests - before.requests,
    totalRequests: requests,
    totalScoredItems: scoredItems,
    promptBytes,
    reservedOutputTokens,
    repeatScoring: scoredItems - candidates.length,
    wasteItems: null,
  };
}

export async function recordedIncrementalTriage() {
  const results = [];
  for (const topic of ['nba', 'world', 'tech']) {
    const window = JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/ranking-${topic}-2026-11-01.json`),
        'utf8',
      ),
    ) as RecordedWindow;
    for (const interval of [1, 3, 6, 24])
      results.push(await evaluateIncrementalTriage(window, interval));
  }
  return results;
}

if (require.main === module)
  void recordedIncrementalTriage().then((results) =>
    console.log(
      JSON.stringify(
        {
          note: 'Synthetic scores over recorded article excerpts, including all in-window candidates. Publication time is an optimistic availability proxy, not ingestion evidence. No quality, cost or live latency measurement. Waste is unknown without successive ingestion/pool snapshots. No production setting or activation.',
          results,
        },
        null,
        2,
      ),
    ),
  );
