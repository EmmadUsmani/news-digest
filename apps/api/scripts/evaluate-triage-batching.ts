// Offline request-shape comparison; no provider, database or environment access.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

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
  warmedIds: readonly string[] = [],
  kind: 'article' | 'social' = 'article',
) {
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || chunkSize > 200)
    throw new Error('Chunk size must be 1–200');
  if (new Set(candidates.map((item) => item.id)).size !== candidates.length)
    throw new Error('Duplicate candidate');
  const candidateIds = new Set(candidates.map((item) => item.id));
  if (
    new Set(warmedIds).size !== warmedIds.length ||
    warmedIds.some((id) => !candidateIds.has(id))
  )
    throw new Error('Warm IDs must be unique members of the candidate pool');
  const cache = new Map<string, TriageScore>();
  const requests: {
    purpose: string;
    items: number;
    inputBytes: number;
    instructionBytes: number;
    excerptBytes: number;
    titleBytes: number;
    sourceBytes: number;
    framingBytes: number;
    reservedOutputTokens: number;
  }[] = [];
  let activeRequests = 0;
  let peakRequests = 0;
  const triage = new CandidateTriage(
    {
      async json(request, validate) {
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
          purpose: request.purpose,
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
        activeRequests++;
        peakRequests = Math.max(peakRequests, activeRequests);
        // Yield so the real triage workers overlap. This measures dispatched
        // fake calls, not provider slots, throughput or elapsed live time.
        await new Promise<void>((resolve) => setImmediate(resolve));
        try {
          return validate({
            items: prompt.candidates.map(({ id }) => ({
              id,
              relevance: 5,
              importance: 5,
              event: 'Synthetic event',
              rationale: 'Offline request-shape probe',
            })),
          });
        } finally {
          activeRequests--;
        }
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
    kind,
  );
  // Populate the real item cache with synthetic scores, then exclude that
  // preparation from publication request measurements. No paid calls occur.
  const warmed = new Set(warmedIds);
  const preparation = candidates.filter((item) => warmed.has(item.id));
  for (let offset = 0; offset < preparation.length; offset += 200)
    await triage.score(
      topic,
      preparation.slice(offset, offset + 200),
      'offline-warmup',
    );
  const preparationRequests = [...requests];
  requests.length = 0;
  peakRequests = 0;
  const batchesPerPass: number[][] = [];
  const requestsPerPass: number[] = [];
  const score = async (size: number) => {
    for (let offset = 0; offset < candidates.length; offset += size) {
      const batch = candidates.slice(offset, offset + size);
      const before = requests.length;
      const result = await triage.score(topic, batch, 'offline-batching');
      requestsPerPass.push(requests.length - before);
      batchesPerPass.push(
        requests.slice(before).map((request) => request.items),
      );
      if (result.unscoredIds.length || result.scores.length !== batch.length)
        throw new Error('Incomplete synthetic scoring');
    }
  };
  await score(chunkSize);
  const coldRequests = requests.length;
  const coldPasses = [...requestsPerPass];
  const coldBatches = [...batchesPerPass];
  const coldPeakRequests = peakRequests;
  // Repartitioning must retain all item-cache hits, independent of wire IDs.
  await score(chunkSize === 200 ? 25 : 200);
  return {
    kind,
    purposes: [
      ...new Set([...preparationRequests, ...requests].map((r) => r.purpose)),
    ],
    chunkSize,
    // Include warmup when assessing overhead; publication savings alone omit
    // work shifted earlier. Synthetic output reservations are not billed usage.
    preparation: {
      requests: preparationRequests.length,
      scoredItems: preparationRequests.reduce((sum, r) => sum + r.items, 0),
      inputBytes: preparationRequests.reduce((sum, r) => sum + r.inputBytes, 0),
      reservedOutputTokens: preparationRequests.reduce(
        (sum, r) => sum + r.reservedOutputTokens,
        0,
      ),
    },
    combined: {
      requests: preparationRequests.length + coldRequests,
      scoredItems: [...preparationRequests, ...requests].reduce(
        (sum, r) => sum + r.items,
        0,
      ),
      inputBytes: [...preparationRequests, ...requests].reduce(
        (sum, r) => sum + r.inputBytes,
        0,
      ),
      reservedOutputTokens: [...preparationRequests, ...requests].reduce(
        (sum, r) => sum + r.reservedOutputTokens,
        0,
      ),
    },
    candidates: candidates.length,
    warmedCandidates: warmedIds.length,
    remainingCandidates: candidates.length - warmedIds.length,
    requests: coldRequests,
    requestsPerPass: coldPasses,
    batchItemsPerPass: coldBatches,
    observedFakePeakRequests: coldPeakRequests,
    batchFill: {
      fullItemLimit: requests.filter((r) => r.items === 50).length,
      belowItemLimit: requests.filter((r) => r.items < 50).length,
      minimumItems: requests.length
        ? Math.min(...requests.map((r) => r.items))
        : 0,
      maximumItems: Math.max(0, ...requests.map((r) => r.items)),
    },
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

export async function recordedTriageBatching(
  warmPattern: 'none' | 'prefix-half' | 'alternating-half' = 'none',
) {
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
    const warmedIds = candidates
      .filter((_, index) =>
        warmPattern === 'prefix-half'
          ? index < Math.ceil(candidates.length / 2)
          : warmPattern === 'alternating-half'
            ? index % 2 === 0
            : false,
      )
      .map(({ id }) => id);
    for (const size of [10, 25, 50, 200])
      results.push({
        topic: window.topic,
        warmPattern,
        ...(await evaluateTriageBatching(topic, candidates, size, warmedIds)),
      });
  }
  return results;
}

// Explicit local input permits social request-shape analysis without adding a
// database/provider dependency or relabelling article fixtures as social posts.
const inputSchema = z
  .object({
    kind: z.enum(['article', 'social']),
    topic: z
      .object({
        id: z.string().min(1).max(200),
        name: z.string(),
        description: z.string(),
        guidance: z.string(),
      })
      .strict(),
    warmedIds: z.array(z.string().min(1).max(200)).default([]),
    candidates: z
      .array(
        z
          .object({
            id: z.string().min(1).max(200),
            title: z.string(),
            excerpt: z.string().nullable(),
            sources: z.array(z.string()),
          })
          .strict(),
      )
      .max(10000),
  })
  .strict();

export async function suppliedTriageBatching(input: unknown) {
  const { kind, topic, candidates, warmedIds } = inputSchema.parse(input);
  const results = [];
  for (const size of [10, 25, 50, 200])
    results.push(
      await evaluateTriageBatching(topic, candidates, size, warmedIds, kind),
    );
  return results;
}

if (require.main === module) {
  const inputPath = process.argv[2];
  const work = async () =>
    inputPath
      ? suppliedTriageBatching(JSON.parse(readFileSync(inputPath, 'utf8')))
      : Promise.all(
          (['none', 'prefix-half', 'alternating-half'] as const).map(
            recordedTriageBatching,
          ),
        ).then((groups) => groups.flat());
  void work()
    .then((results) =>
      console.log(
        JSON.stringify({
          note: `${inputPath ? 'Supplied local candidates and topic context' : 'Recorded article excerpts with empty topic guidance'}. Synthetic scores only. Bytes are not tokens; output reservations are not usage. Chunk size bounds each sequential caller pass; production still splits internally at 50 items/60,000 conservative bytes and permits four requests per pass. Observed peak covers fake dispatch only, before provider admission. Batch fill below 50 can reflect bytes, cache hits or caller boundaries; no split cause inferred. No latency, cost or quality measurement; no production change.`,
          results,
        }),
      ),
    )
    .catch(() => {
      console.error(
        'Batching evaluation failed: expected valid local kind/topic/candidates input',
      );
      process.exitCode = 1;
    });
}
