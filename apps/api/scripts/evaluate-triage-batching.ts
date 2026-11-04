// Offline request-shape comparison; no provider, database or environment access.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { llmConfig } from '../src/modules/curation/adapters/config';
import {
  CandidateTriage,
  type TriageCandidate,
  type TriageScore,
  type TriageTopic,
} from '../src/modules/curation/application/triage';

export async function evaluateTriageBatching(
  topic: TriageTopic,
  candidates: TriageCandidate[],
  chunkSize: number,
) {
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 200)
    throw new Error('Chunk size must be 1–200');
  if (new Set(candidates.map((item) => item.id)).size !== candidates.length)
    throw new Error('Duplicate candidate');
  const cache = new Map<string, TriageScore>();
  const requests: {
    items: number;
    inputBytes: number;
    instructionBytes: number;
    excerptBytes: number;
    titleBytes: number;
    sourceBytes: number;
    framingBytes: number;
    reservedOutputTokens: number;
  }[] = [];
  const triage = new CandidateTriage(
    {
      json(request, validate) {
        const prompt = JSON.parse(request.prompt) as {
          candidates: {
            id: string;
            excerpt: string | null;
            title: string;
            sources: string[];
          }[];
        };
        const bytes = (value: unknown) =>
          Buffer.byteLength(JSON.stringify(value));
        const instructionBytes = Buffer.byteLength(request.instructions);
        const excerptBytes = prompt.candidates.reduce(
          (sum, item) => sum + bytes(item.excerpt),
          0,
        );
        const titleBytes = prompt.candidates.reduce(
          (sum, item) => sum + bytes(item.title),
          0,
        );
        const sourceBytes = prompt.candidates.reduce(
          (sum, item) => sum + bytes(item.sources),
          0,
        );
        requests.push({
          instructionBytes,
          excerptBytes,
          titleBytes,
          sourceBytes,
          framingBytes:
            Buffer.byteLength(request.prompt) -
            excerptBytes -
            titleBytes -
            sourceBytes,
          items: prompt.candidates.length,
          inputBytes: Buffer.byteLength(request.instructions + request.prompt),
          reservedOutputTokens: request.maxOutputTokens,
        });
        return Promise.resolve(
          validate({
            items: prompt.candidates.map(({ id }) => ({
              id,
              relevance: 5,
              importance: 5,
              event: 'Synthetic event',
              rationale: 'Offline request-shape probe',
            })),
          }),
        );
      },
    },
    {
      cached(key) {
        return Promise.resolve(cache.get(key) ?? null);
      },
      cache(key, value) {
        cache.set(key, value as TriageScore);
        return Promise.resolve();
      },
    },
    llmConfig({}).haiku,
  );
  const requestsPerPass: number[] = [];
  const score = async (size: number) => {
    for (let offset = 0; offset < candidates.length; offset += size) {
      const batch = candidates.slice(offset, offset + size);
      const before = requests.length;
      const result = await triage.score(topic, batch, 'offline-batching');
      requestsPerPass.push(requests.length - before);
      if (result.unscoredIds.length || result.scores.length !== batch.length)
        throw new Error('Incomplete synthetic scoring');
    }
  };
  await score(chunkSize);
  const coldRequests = requests.length;
  const coldPasses = [...requestsPerPass];
  // Repartitioning must retain all item-cache hits, independent of wire IDs.
  await score(chunkSize === 200 ? 25 : 200);
  return {
    chunkSize,
    candidates: candidates.length,
    requests: coldRequests,
    requestsPerPass: coldPasses,
    // Equal-duration, independent calls only. Caller passes remain sequential.
    // These capacity rounds are not measured time or a feasible live schedule.
    equalDurationRounds: [1, 2, 4].map((slots) => ({
      slots,
      rounds: coldPasses.reduce(
        (sum, count) => sum + Math.ceil(count / slots),
        0,
      ),
    })),
    repeatRequests: requests.length - coldRequests,
    scoredItems: requests.reduce((sum, request) => sum + request.items, 0),
    inputBytes: requests.reduce((sum, request) => sum + request.inputBytes, 0),
    inputComposition: {
      instructions: requests.reduce((sum, r) => sum + r.instructionBytes, 0),
      excerpts: requests.reduce((sum, r) => sum + r.excerptBytes, 0),
      titles: requests.reduce((sum, r) => sum + r.titleBytes, 0),
      sources: requests.reduce((sum, r) => sum + r.sourceBytes, 0),
      framing: requests.reduce((sum, r) => sum + r.framingBytes, 0),
    },
    maximumInputBytes: Math.max(0, ...requests.map((r) => r.inputBytes)),
    reservedOutputTokens: requests.reduce(
      (sum, request) => sum + request.reservedOutputTokens,
      0,
    ),
    maximumReservedOutputTokens: Math.max(
      0,
      ...requests.map((r) => r.reservedOutputTokens),
    ),
  };
}

export async function recordedTriageBatching() {
  const results = [];
  for (const name of ['nba', 'world', 'tech']) {
    const window = JSON.parse(
      readFileSync(
        join(__dirname, `../test/fixtures/ranking-${name}-2026-11-01.json`),
        'utf8',
      ),
    ) as {
      topic: string;
      windowStart: string;
      windowEnd: string;
      candidates: (TriageCandidate & { publishedAt: string })[];
    };
    const candidates = window.candidates.filter(
      (item) =>
        Date.parse(item.publishedAt) >= Date.parse(window.windowStart) &&
        Date.parse(item.publishedAt) < Date.parse(window.windowEnd),
    );
    const topic = {
      id: window.topic,
      name: window.topic,
      description: '',
      guidance: '',
    };
    for (const size of [10, 25, 50, 200])
      results.push({
        topic: window.topic,
        ...(await evaluateTriageBatching(topic, candidates, size)),
      });
  }
  return results;
}

if (require.main === module) {
  void recordedTriageBatching().then((results) =>
    console.log(
      JSON.stringify({
        note: 'Recorded excerpts with empty topic guidance and synthetic scores. Bytes are not tokens; output reservations are not usage. Chunk size bounds each sequential caller pass; production still splits internally at 50 items/60,000 conservative bytes and permits four requests per pass. No latency, cost or quality measurement; no production change.',
        results,
      }),
    ),
  );
}
