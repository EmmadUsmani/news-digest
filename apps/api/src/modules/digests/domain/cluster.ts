import type { Candidate } from './rank';
const words = (title: string) =>
  title
    .normalize('NFKC')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
const ignored = new Set([
  'a',
  'an',
  'the',
  'in',
  'on',
  'at',
  'to',
  'of',
  'for',
  'and',
  'with',
  'as',
  'is',
  'are',
  'after',
]);
export function sameEvent(a: Candidate, b: Candidate): boolean {
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  // Unknown event timing cannot establish proximity, even for identical titles.
  if (!Number.isFinite(delta) || delta > 36 * 3600000) return false;
  const left = words(a.title),
    right = words(b.title);
  // Preserve number order: reversed scores or version transitions can describe different events.
  if (
    left.filter((t) => /\d/.test(t)).join('|') !==
    right.filter((t) => /\d/.test(t)).join('|')
  )
    return false;
  if (left.join(' ') === right.join(' ')) return true;
  // Do not collapse announcements into reversals merely because entities overlap.
  const actions =
    /^(announc|launch|releas|delay|cancel|den|confirm|approv|reject|win|lose|beat|not|never)/;
  if (
    left
      .filter((t) => actions.test(t))
      .sort()
      .join('|') !==
    right
      .filter((t) => actions.test(t))
      .sort()
      .join('|')
  )
    return false;
  const x = new Set(left.filter((t) => !ignored.has(t))),
    y = new Set(right.filter((t) => !ignored.has(t)));
  if (Math.min(x.size, y.size) < 4) return false;
  const overlap = [...x].filter((t) => y.has(t)).length;
  return (
    overlap / Math.min(x.size, y.size) >= 0.8 &&
    overlap / new Set([...x, ...y]).size >= 0.65
  );
}
// Complete-link grouping prevents chains of overlapping headlines merging distinct events.
// Input is already score ordered; the strongest candidate remains the lead.
export function clusterCandidates(
  candidates: Candidate[],
  matches: (a: Candidate, b: Candidate) => boolean = sameEvent,
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
