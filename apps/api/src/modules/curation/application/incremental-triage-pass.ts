import type { CandidateTriage, TriageCandidate, TriageTopic } from './triage';

// Prepared orchestration only; no scheduler invokes this pass yet. The caller
// supplies an eligible pool and a reserve-safe background scorer.
export async function incrementalTriagePass(
  triage: Pick<CandidateTriage, 'pending' | 'score'>,
  topic: TriageTopic,
  candidates: TriageCandidate[],
  runId: string,
  options: { minimumPending: number; maximumItems: number },
) {
  if (
    !Number.isInteger(options.minimumPending) ||
    options.minimumPending < 1 ||
    !Number.isInteger(options.maximumItems) ||
    options.maximumItems < 1 ||
    options.maximumItems > 200 ||
    options.minimumPending > options.maximumItems
  )
    throw new Error('Expected 1 <= minimum pending <= maximum items <= 200');
  if (new Set(candidates.map((c) => c.id)).size !== candidates.length)
    throw new Error('Expected unique candidates');
  const pending: TriageCandidate[] = [];
  for (let offset = 0; offset < candidates.length; offset += 200)
    pending.push(
      ...(await triage.pending(topic, candidates.slice(offset, offset + 200))),
    );
  const selected =
    pending.length >= options.minimumPending
      ? pending.slice(0, options.maximumItems)
      : [];
  const result = selected.length
    ? await triage.score(topic, selected, runId)
    : { scores: [], unscoredIds: [] };
  return {
    pendingItems: pending.length,
    attemptedIds: selected.map((c) => c.id),
    scoredIds: result.scores.map((s) => s.id),
    unscoredIds: result.unscoredIds,
    deferredItems: pending.length - selected.length,
  };
}
