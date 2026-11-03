import { nbaTeamAliases } from './game-event';
import type { Candidate } from './rank';

const months = [
  'jan(?:uary)?',
  'feb(?:ruary)?',
  'mar(?:ch)?',
  'apr(?:il)?',
  'may',
  'jun(?:e)?',
  'jul(?:y)?',
  'aug(?:ust)?',
  'sep(?:tember)?',
  'oct(?:ober)?',
  'nov(?:ember)?',
  'dec(?:ember)?',
];

// Ceremony identity needs a full player name, franchise, number and calendar
// date. A career retirement or a month-only announcement is insufficient.
function ceremony(candidate: Candidate): string | null {
  const title = candidate.title.normalize('NFKC').toLowerCase();
  const text = `${title}. ${candidate.excerpt}`.normalize('NFKC').toLowerCase();
  const published = new Date(candidate.publishedAt);
  if (
    !Number.isFinite(published.getTime()) ||
    /[?？]|\b(not|never|denies|denied|rumou?r|could|might|would|should|if|unless|previously|last year|years? ago|postponed|cancelled|canceled|rescheduled)\b/.test(
      text,
    )
  )
    return null;
  const player =
    /\bretire ([a-z]+(?: [a-z]+){1,3})[’']s (?:no\. \d+ )?jersey\b/.exec(
      title,
    )?.[1] ??
    /^([a-z]+(?: [a-z]+){1,3}) (?:number|jersey) retirement:/.exec(title)?.[1];
  if (!player || /\bmay (?:be|retire|hang|hold|take)\b/.test(text)) return null;
  const clubs = nbaTeamAliases.flatMap((aliases, index) =>
    aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(title))
      ? [index]
      : [],
  );
  if (clubs.length !== 1) return null;
  const numbers = new Set(
    [...text.matchAll(/\bno\.\s*(\d{1,2})\b/g)].map((match) =>
      Number(match[1]),
    ),
  );
  if (numbers.size !== 1) return null;
  const dates = new Set<string>();
  for (const [month, pattern] of months.entries()) {
    for (const match of text.matchAll(
      new RegExp(
        `\\b${pattern}\\.? (\\d{1,2})(?:st|nd|rd|th)?(?:,? ([1-9]\\d{3}))?\\b`,
        'g',
      ),
    )) {
      const day = Number(match[1]);
      // Undated upcoming ceremonies resolve to the next occurrence, never to
      // the current year blindly when the announcement is late in the year.
      let year = Number(match[2] ?? published.getUTCFullYear());
      if (!match[2] && Date.UTC(year, month, day + 1) <= published.getTime())
        year++;
      const date = new Date(Date.UTC(year, month, day));
      if (
        date.getUTCMonth() !== month ||
        date.getUTCDate() !== day ||
        date.getTime() + 86400000 <= published.getTime()
      )
        return null;
      dates.add(date.toISOString().slice(0, 10));
    }
  }
  if (dates.size !== 1) return null;
  return JSON.stringify([player, clubs[0], [...numbers][0], [...dates][0]]);
}

export function sameJerseyCeremony(a: Candidate, b: Candidate): boolean {
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  if (!Number.isFinite(delta) || delta > 36 * 3600000) return false;
  const left = ceremony(a);
  return left !== null && left === ceremony(b);
}

export function isJerseyCeremonyReport(candidate: Candidate): boolean {
  return /\b(?:jersey|number) retirement\b|\bretire .{1,80} jersey\b/i.test(
    candidate.title,
  );
}
