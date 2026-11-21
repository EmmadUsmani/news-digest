// Evaluation only: reserve enough X choices for the existing preference, then
// let stronger qualified alternatives compete for the remaining editor slots.
export function shortlistEventCandidates<T>(
  candidates: T[],
  budget: number,
  evidence: (candidate: T) => {
    platform: string;
    interestingness: number;
    relevance: number;
  },
): T[] {
  const ranked = [...candidates].sort(
    (a, b) =>
      evidence(b).interestingness - evidence(a).interestingness ||
      evidence(b).relevance - evidence(a).relevance,
  );
  const reserved = ranked
    .filter((candidate) => evidence(candidate).platform === 'x')
    .slice(0, Math.ceil(budget * 0.7));
  const chosen = new Set(reserved);
  return [
    ...reserved,
    ...ranked.filter((candidate) => !chosen.has(candidate)),
  ].slice(0, 10);
}
