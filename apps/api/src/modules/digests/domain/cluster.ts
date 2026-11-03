import type { Candidate } from './rank';

// Grouping stays disabled until a validated AI pass supplies event membership.
export const noGrouping = (_a: Candidate, _b: Candidate): boolean => false;

// Complete-link grouping prevents chains of overlapping headlines merging distinct events.
// Input is already score ordered; the strongest candidate remains the lead.
export function clusterCandidates(
  candidates: Candidate[],
  matches: (a: Candidate, b: Candidate) => boolean = noGrouping,
): Candidate[][] {
  const clusters: Candidate[][] = [];
  for (const candidate of candidates) {
    const group = clusters.find((items) =>
      items.every((item) => matches(item, candidate)),
    );
    if (group) group.push(candidate);
    else clusters.push([candidate]);
  }
  return clusters;
}
