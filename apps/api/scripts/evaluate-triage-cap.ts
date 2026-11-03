// Offline only: assess admission loss before changing production triage volume.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { relevancePolicySchema } from '@digest/contracts';

import { qualityRejection } from '../src/modules/digests/domain/quality';
import type { Candidate } from '../src/modules/digests/domain/rank';
import { assessRelevance } from '../src/modules/digests/domain/relevance';

interface Window {
  topic: string;
  windowStart: string;
  windowEnd: string;
  relevancePolicy: unknown;
  candidates: Candidate[];
  events: { name: string; ids: string[] }[];
}

export function evaluateTriageCap(window: Window, cap: number) {
  if (!Number.isInteger(cap) || cap < 1 || cap > 200)
    throw new Error('Expected integer cap between 1 and 200');
  const ids = new Set(window.candidates.map((item) => item.id));
  if (ids.size !== window.candidates.length)
    throw new Error('Duplicate candidate IDs');
  for (const event of window.events)
    if (!event.ids.length || event.ids.some((id) => !ids.has(id)))
      throw new Error('Missing event candidate');
  const start = Date.parse(window.windowStart);
  const end = Date.parse(window.windowEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
    throw new Error('Invalid window');
  const policy = relevancePolicySchema.parse(window.relevancePolicy);
  const baseline = window.candidates
    .filter((item) => {
      const time = Date.parse(item.publishedAt);
      return (
        time >= start &&
        time < end &&
        !qualityRejection(item) &&
        assessRelevance(item, { ...policy, includeAny: [] }).eligible
      );
    })
    .sort(
      (a, b) =>
        Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
        a.id.localeCompare(b.id),
    );
  const baselineIds = new Set(baseline.map((item) => item.id));
  const admitted = new Set(baseline.slice(0, cap).map((item) => item.id));
  const reachable = window.events.filter((event) =>
    event.ids.some((id) => baselineIds.has(id)),
  );
  return {
    topic: window.topic,
    cap,
    loaded: window.candidates.length,
    baselineCandidates: baseline.length,
    admitted: admitted.size,
    omittedByCap: baseline.length - admitted.size,
    // Cold 50-item batches only; cache hits and token sizes change actual calls.
    coldBatchesBefore: Math.ceil(baseline.length / 50),
    coldBatchesAfter: Math.ceil(admitted.size / 50),
    labeledEvents: window.events.length,
    baselineReachableEvents: reachable.length,
    baselineMissingEvents: window.events
      .filter((event) => !reachable.includes(event))
      .map((event) => event.name),
    lostEvents: reachable
      .filter((event) => !event.ids.some((id) => admitted.has(id)))
      .map((event) => event.name),
    omittedLabeledArticles: reachable.reduce(
      (count, event) =>
        count +
        event.ids.filter((id) => baselineIds.has(id) && !admitted.has(id))
          .length,
      0,
    ),
  };
}

export function recordedTriageCaps() {
  return ['nba', 'world', 'tech'].flatMap((topic) => {
    const window = JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/ranking-${topic}-2026-11-01.json`),
        'utf8',
      ),
    ) as Window;
    return [20, 30, 40, 50, 200].map((cap) => evaluateTriageCap(window, cap));
  });
}

if (require.main === module)
  console.log(
    JSON.stringify(
      {
        note: 'Recorded excerpts and existing labels only; admission recall is not editorial quality or live latency. No inference, publication or production cap. Gaming and current 200-item pools are unmeasured.',
        results: recordedTriageCaps(),
      },
      null,
      2,
    ),
  );
