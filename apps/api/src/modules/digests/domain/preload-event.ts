import type { Candidate } from './rank';

// Opt-in only: match schedule overview headlines, not changes to a schedule.
// Requiring the game name before the event avoids treating a publisher as the game.
function preloadOverview(candidate: Candidate): string | null {
  const title = candidate.title.normalize('NFKC').toLowerCase();
  const text = `${title}. ${candidate.excerpt}`;
  if (
    /[?？]|\b(not|never|denies|denied|rumou?r|reportedly|might|could|may|would|should|if|unless|allegedly|delayed?|cancelled?|canceled?|moved|earlier|later|previously|last year|years? ago)\b/i.test(
      text,
    )
  )
    return null;
  const match =
    /^([\p{L}\p{N}][\p{L}\p{N} :'-]{1,70}?) pre-?load (?:dates?|times?)\b/u.exec(
      title,
    );
  if (!match) return null;
  // Concrete dates, sizes or versions beyond the entity need a richer parser.
  // Also refuse secondary announcements mixed into an overview headline.
  const suffix = title
    .slice(match[1].length)
    .replace(/\b(?:ps[45]|playstation [45]|switch 2)\b/g, '');
  if (
    /\d|\b(delay|cancel|change|update|patch|trailer|sales|revenue|rumor)\w*\b/.test(
      suffix,
    )
  )
    return null;
  return match[1];
}

export function samePreloadOverview(a: Candidate, b: Candidate): boolean {
  // Match the longest hardware name first, preserving editions and generations.
  // Deduplicate repeated mentions so repetition alone cannot split an overview.
  const platforms = (title: string) => {
    const names = title
      .normalize('NFKC')
      .toLowerCase()
      .match(
        /\b(?:ps5 pro|playstation 5 pro|ps[45]|playstation [45]|xbox series [xs]|xbox one|xbox|pc|switch 2|switch)\b/g,
      )
      ?.map((name) => name.replace('playstation ', 'ps'));
    return names ? [...new Set(names)].sort().join('|') : undefined;
  };
  const ap = platforms(a.title),
    bp = platforms(b.title);
  if (ap && bp && ap !== bp) return false;
  const left = preloadOverview(a);
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  return (
    left !== null &&
    left === preloadOverview(b) &&
    Number.isFinite(delta) &&
    delta <= 36 * 3600000
  );
}
