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
  const suffix = title.slice(match[1].length).replace(/\bps[45]\b/g, '');
  if (
    /\d|\b(delay|cancel|change|update|patch|trailer|sales|revenue|rumor)\w*\b/.test(
      suffix,
    )
  )
    return null;
  return match[1];
}

export function samePreloadOverview(a: Candidate, b: Candidate): boolean {
  const platforms = (title: string) =>
    title
      .toLowerCase()
      .match(/\b(?:ps[45]|xbox|pc|switch)\b/g)
      ?.sort()
      .join('|');
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
