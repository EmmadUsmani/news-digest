import type { Candidate } from './rank';

function normalizeNumeral(value: string): string {
  const numerals: Record<string, string> = {
    ii: '2',
    iii: '3',
    iv: '4',
    v: '5',
    vi: '6',
    vii: '7',
    viii: '8',
    ix: '9',
    x: '10',
  };
  return value.replace(
    /\b(ii|iii|iv|v|vi|vii|viii|ix|x)(?=:|$)/,
    (_, numeral: string) => numerals[numeral],
  );
}

// Opt-in: require an explicit named sequel/subtitle and a title announcement.
// Do not infer the event from a franchise mention or a generic new trailer.
function revealedTitle(candidate: Candidate): string | null {
  const title = candidate.title.normalize('NFKC').toLowerCase();
  if (
    /\bin (?:19|20)\d{2}\b/.test(title) ||
    /[?？]|\b(not|never|denies|denied|fake|fan|concept|rumou?r|reportedly|might|could|may|would|should|if|unless|allegedly|previously|last year|years? ago|will|expected|leaked?|delayed?|cancelled?|canceled?)\b/.test(
      title,
    )
  )
    return null;
  // Successor framing and publisher confirmation still name the full game.
  // Anchor both ends so a trailer, release date or other event cannot qualify.
  const reframed = /^.+? successor finally re-revealed as (.+)$/.exec(title);
  const confirmed =
    /^[\p{L}][\p{L} '-]{1,60} officially confirms (.+) as its next game$/u.exec(
      title,
    );
  // A headline may omit the subtitle. Accept it only when the excerpt makes
  // one explicit naming assertion for that exact franchise and sequel.
  const unnamed =
    /^(?:'|“)?((?:the )?[\p{L}][\p{L} '-]{1,60} (?:[1-9]\d?|ii|iii|iv|v|vi|vii|viii|ix|x))(?:'|”)? finally has an official title$/u.exec(
      title,
    );
  let excerptIdentity: string | undefined;
  if (unnamed) {
    const excerpt = candidate.excerpt.normalize('NFKC').toLowerCase();
    const assertions = [
      ...excerpt.matchAll(
        /\bthe next game in the series is titled ([\p{L}][\p{L} '-]{1,60} (?:[1-9]\d?|ii|iii|iv|v|vi|vii|viii|ix|x): [\p{L}][\p{L} '-]{1,50}?)(?=\s*\(|[.!?]|$)/gu,
      ),
    ];
    if (assertions.length !== 1) return null;
    const assertion = assertions[0];
    const sentence = excerpt.slice(0, assertion.index).split(/[.!?]/).at(-1)!;
    if (
      /\b(not|never|rumou?r|reportedly|might|could|may|would|should|if|unless|allegedly|previously|last year|years? ago|in (?:19|20)\d{2})\b/.test(
        sentence,
      )
    )
      return null;
    const normalizeBase = (value: string) =>
      normalizeNumeral(value.replace(/^the /, ''));
    if (normalizeBase(unnamed[1]) !== normalizeBase(assertion[1].split(':')[0]))
      return null;
    excerptIdentity = assertion[1];
  }
  const identity = reframed?.[1] ?? confirmed?.[1] ?? excerptIdentity;
  const announcement = identity
    ? `${identity} is finally made official`
    : title;
  const match =
    /^(?:the )?([\p{L}][\p{L} '-]{1,60} (?:[1-9]\d?|ii|iii|iv|v|vi|vii|viii|ix|x): [\p{L}][\p{L} '-]{1,50}?) (?:[–—-] official (?:name|title) reveal trailer|is finally made official|title officially revealed)(?:$|[,.:])/u.exec(
      announcement,
    );
  if (!match) return null;
  return normalizeNumeral(match[1]);
}

export function sameTitleReveal(a: Candidate, b: Candidate): boolean {
  const left = revealedTitle(a);
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  return (
    left !== null &&
    left === revealedTitle(b) &&
    Number.isFinite(delta) &&
    delta <= 36 * 3600000
  );
}
