import { sameEventWithGameScore } from './game-event';
import type { Candidate } from './rank';

// Offline/opt-in only. Require a named studio directly followed by a closure
// assertion, rather than inferring closure from funding cuts or a cancelled game.
function closedStudio(candidate: Candidate): string | null {
  const text = `${candidate.title}. ${candidate.excerpt}`.normalize('NFKC');
  if (
    /\b(not|never|denies|denied|rumou?r|might|could|may|reopens?|reopened)\b/i.test(
      text,
    )
  )
    return null;
  const matches = [
    ...text.matchAll(
      /\b([A-Z][a-zA-Z]+ Studios?),? (?:[Hh]as |[Ii]s |[Ww]as )?(?:[Oo]fficially )?(?:[Ss]hut down|[Ss]huts down|[Cc]losed|[Cc]loses)\b/g,
    ),
  ];
  // Do not mistake the last word of a multiword studio name for its identity.
  if (
    matches.some((match) => {
      const prefix = text.slice(0, match.index);
      return /[A-Z][a-zA-Z]+ $/.test(prefix) && !/\b(?:As|The) $/.test(prefix);
    })
  )
    return null;
  const names = new Set(matches.map((match) => match[1].toLowerCase()));
  return names.size === 1 ? [...names][0] : null;
}

export function sameEventWithStudioClosure(
  a: Candidate,
  b: Candidate,
): boolean {
  const left = closedStudio(a);
  const right = closedStudio(b);
  if (left !== null || right !== null) {
    const delta = Math.abs(
      Date.parse(a.publishedAt) - Date.parse(b.publishedAt),
    );
    return (
      Number.isFinite(delta) &&
      delta <= 36 * 3600000 &&
      left !== null &&
      left === right
    );
  }
  return sameEventWithGameScore(a, b);
}
