import type {
  TriageResult,
  TriageTopic,
} from '../../curation/public/editorial';
import type { Candidate } from '../domain/rank';

interface TriagePort {
  score(
    topic: TriageTopic,
    candidates: Candidate[],
    runId: string,
  ): Promise<TriageResult>;
}

// Prepared only: retain scores for both scopes, without deciding ownership or
// filtering reports before cross-topic event assignment. No production caller.
export async function jointStoryTriage(
  triage: TriagePort,
  scopes: TriageTopic[],
  candidates: Candidate[],
  runId: string,
): Promise<Map<string, TriageResult> | null> {
  const ids = new Set(candidates.map((item) => item.id));
  if (
    scopes.length !== 2 ||
    new Set(scopes.map((scope) => scope.id)).size !== 2 ||
    scopes.some((scope) => !scope.id) ||
    candidates.length > 200 ||
    ids.size !== candidates.length ||
    candidates.some((item) => !item.id)
  )
    return null;
  const results = new Map<string, TriageResult>();
  try {
    for (const scope of scopes) {
      const result = candidates.length
        ? await triage.score(scope, candidates, runId)
        : { scores: [], unscoredIds: [] };
      const scored = new Set(result.scores.map((score) => score.id));
      if (
        result.unscoredIds.length ||
        result.failures?.length ||
        scored.size !== candidates.length ||
        result.scores.length !== candidates.length ||
        result.scores.some(
          (score) =>
            !ids.has(score.id) ||
            !Number.isInteger(score.relevance) ||
            score.relevance < 0 ||
            score.relevance > 10 ||
            !Number.isInteger(score.importance) ||
            score.importance < 0 ||
            score.importance > 10,
        )
      )
        return null;
      results.set(scope.id, result);
    }
    return results;
  } catch {
    return null;
  }
}
