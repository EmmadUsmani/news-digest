import type { Candidate } from './rank';
import { rank } from './rank';

// Saved semantic scores take priority; missing scores retain heuristic order.
// The returned importance is an ordinal priority, not an AI score.
export function cachedReactionStories(
  candidates: Candidate[],
  scores: { id: string; relevance: number; importance: number }[],
  start: Date,
  end: Date,
) {
  const byId = new Map(scores.map((score) => [score.id, score]));
  const ranked = candidates
    .flatMap((candidate) => rank([candidate], start, end, 1))
    .filter((candidate) => {
      const score = byId.get(candidate.id);
      return !score || score.relevance >= 6;
    })
    .sort((a, b) => {
      const left = byId.get(a.id);
      const right = byId.get(b.id);
      return (
        Number(Boolean(right)) - Number(Boolean(left)) ||
        (right?.importance ?? 0) - (left?.importance ?? 0) ||
        (right?.relevance ?? 0) - (left?.relevance ?? 0) ||
        b.score - a.score ||
        a.id.localeCompare(b.id)
      );
    });
  return ranked.map((candidate, index) => ({
    id: candidate.id,
    title: candidate.title,
    importance: ranked.length - index,
    cachedScore: byId.get(candidate.id) ?? null,
    heuristicScore: candidate.score,
  }));
}
