// Offline refusal/recovery probe through the production triage worker loop.
import { llmConfig } from '../src/modules/curation/adapters/config';
import {
  CandidateTriage,
  type TriageScore,
} from '../src/modules/curation/application/triage';

export async function evaluateTriageRecovery(
  count: number,
  chunkSize: number,
  kind: 'article' | 'social',
  failure: 'refusal' | 'throw',
) {
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 10000 ||
    !Number.isInteger(chunkSize) ||
    chunkSize < 1 ||
    chunkSize > 200
  )
    throw new Error('Invalid pool or caller size');
  const candidates = Array.from({ length: count }, (_, i) => ({
    id: `synthetic-${i}`,
    title: `Synthetic item ${i}`,
    excerpt: null,
    sources: ['offline'],
  }));
  const topic = {
    id: 'offline',
    name: 'Offline',
    description: '',
    guidance: '',
  };
  const cache = new Map<string, TriageScore>();
  const calls: { phase: string; ids: string[]; failed: boolean }[] = [];
  let phase = 'initial';
  let active = 0;
  let peak = 0;
  const triage = new CandidateTriage(
    {
      async json(request, validate) {
        const prompt = JSON.parse(request.prompt) as {
          candidates: { id: string; originalId: string }[];
        };
        const failed = calls.length === 0;
        calls.push({
          phase,
          ids: prompt.candidates.map((c) => c.originalId),
          failed,
        });
        active++;
        peak = Math.max(peak, active);
        await new Promise<void>((resolve) => setImmediate(resolve));
        try {
          if (failed) {
            if (failure === 'throw')
              throw new Error('Synthetic transport failure');
            return null;
          }
          return validate({
            items: prompt.candidates.map(({ id }) => ({
              id,
              relevance: 5,
              importance: 5,
              event: 'Synthetic event',
              rationale: 'Offline probe',
            })),
          });
        } finally {
          active--;
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
  const pass = async () => {
    let unscored = 0;
    let thrown = 0;
    for (let offset = 0; offset < count; offset += chunkSize) {
      const batch = candidates.slice(offset, offset + chunkSize);
      try {
        unscored += (await triage.score(topic, batch, 'offline-recovery'))
          .unscoredIds.length;
      } catch {
        thrown++;
        unscored += (await triage.pending(topic, batch)).length;
      }
      // Mirror a caller that stops after an incomplete or failed pass.
      if (unscored || thrown) break;
    }
    return {
      unscoredInAttemptedPasses: unscored,
      thrown,
      activeAfterPass: active,
    };
  };
  const initial = await pass();
  const cachedAfterFailure = cache.size;
  phase = 'recovery';
  const recovery = await pass();
  const cachedAfterRecovery = cache.size;
  phase = 'repeat';
  const repeat = await pass();
  const phaseCalls = (name: string) => calls.filter((c) => c.phase === name);
  const successfulIds = calls.filter((c) => !c.failed).flatMap((c) => c.ids);
  return {
    kind,
    failure,
    candidates: count,
    chunkSize,
    initial,
    recovery,
    repeat,
    cachedAfterFailure,
    cachedAfterRecovery,
    observedFakePeakRequests: peak,
    initialBatchItems: phaseCalls('initial').map((c) => c.ids.length),
    recoveryBatchItems: phaseCalls('recovery').map((c) => c.ids.length),
    repeatRequests: phaseCalls('repeat').length,
    requestedItems: calls.reduce((sum, c) => sum + c.ids.length, 0),
    successfullyScoredItems: successfulIds.length,
    duplicateSuccessfulItems:
      successfulIds.length - new Set(successfulIds).size,
  };
}

if (require.main === module) {
  void (async () => {
    const results = [];
    for (const kind of ['article', 'social'] as const)
      for (const failure of ['refusal', 'throw'] as const)
        for (const size of [25, 50, 200])
          results.push(await evaluateTriageRecovery(200, size, kind, failure));
    console.log(
      JSON.stringify({
        note: 'Synthetic first-call failure; caller stops on incomplete passes. Recovery is explicit, not a production retry policy. No provider repair, latency, billed cost or live failure rate measured.',
        results,
      }),
    );
  })();
}
