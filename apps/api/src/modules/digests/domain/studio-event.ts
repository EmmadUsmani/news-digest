import { sameEventWithGameScore } from './game-event';
import type { Candidate } from './rank';

// Offline/opt-in only. Require a named studio directly followed by a closure
// assertion, rather than inferring closure from funding cuts or a cancelled game.
function closedStudio(candidate: Candidate): string | null | false {
  const text = `${candidate.title}. ${candidate.excerpt}`.normalize('NFKC');
  if (!/\b[A-Z][a-zA-Z]+ Studios?\b/.test(text)) return null;
  if (
    /[?？]|\b(not|never|denies|denied|rumou?r|might|could|may|would|should|if|unless|allegedly|reopens?|reopened)\b/i.test(
      text,
    )
  )
    return false;
  if (/\breportedly\b/i.test(candidate.title)) return false;
  const matches = [
    ...text.matchAll(
      /\b([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)* Studios?),? (?:[Hh]as |[Ii]s |[Ww]as )?(?:[Oo]fficially )?(?:[Ss]hut down|[Ss]huts down|[Cc]losed|[Cc]loses)\b/g,
    ),
  ];
  // A publication timestamp does not date the event. Historical retrospectives
  // and prospective claims need stronger evidence than this narrow rule has.
  if (
    /\b(?:years? ago|last year|previously|formerly|once|will|plans? to|set to|expected to)\b/i.test(
      candidate.title,
    ) ||
    matches.some((match) =>
      /^[^.!?]{0,60}\b(?:(?:19|20)\d{2}|years? ago|last year)\b/.test(
        text.slice(match.index + match[0].length),
      ),
    )
  )
    return false;
  // Keep the entire proper name: matching only its final word would conflate
  // Copper Studio with Silver Copper Studio. Leading sentence connectives
  // are not part of the identity, preserving the existing single-word rule.
  const names = new Set(
    matches.map((match) =>
      match[1].split(/\bAs /).at(-1)!.replace(/^The /, '').toLowerCase(),
    ),
  );
  return names.size === 1 ? [...names][0] : names.size > 1 ? false : null;
}

export function sameEventWithStudioClosure(
  a: Candidate,
  b: Candidate,
): boolean {
  const left = closedStudio(a);
  const right = closedStudio(b);
  if (left === false || right === false) return false;
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
