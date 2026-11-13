import { LlmValidationFailure } from './validation-failure';

// Bounded Gaming rollout for the saved invented launch date. This recognizes
// explicit English/French month dates and ISO dates, not general factual support.
const months = [
  ['jan', 'january', 'janvier'],
  ['feb', 'february', 'fevrier'],
  ['mar', 'march', 'mars'],
  ['apr', 'april', 'avril'],
  ['may', 'mai'],
  ['jun', 'june', 'juin'],
  ['jul', 'july', 'juillet'],
  ['aug', 'august', 'aout'],
  ['sep', 'sept', 'september', 'septembre'],
  ['oct', 'october', 'octobre'],
  ['nov', 'november', 'novembre'],
  ['dec', 'december', 'decembre'],
];
type CalendarDate = { month: number; day: number; year?: number };
function dates(text: string): CalendarDate[] {
  const normalized = text
    .replace(/(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}\/\S*/gi, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  const found: CalendarDate[] = [];
  for (const match of normalized.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    found.push({ year: +match[1], month: +match[2], day: +match[3] });
  }
  for (const [index, names] of months.entries()) {
    const month = `(?:${names.join('|')})\\.?`;
    const day = '(\\d{1,2})(?:st|nd|rd|th|er)?';
    const year = '(?:,?\\s+(\\d{4}))?';
    for (const pattern of [
      `\\b${month}\\s+${day}${year}\\b`,
      `\\b${day}\\s+${month}${year}\\b`,
    ]) {
      for (const match of normalized.matchAll(new RegExp(pattern, 'g'))) {
        found.push({
          month: index + 1,
          day: +match[1],
          year: match[2] ? +match[2] : undefined,
        });
      }
    }
  }
  return found;
}

export function assertSocialDateSupport(text: string, source: string): void {
  const evidence = dates(source);
  if (
    dates(text).some(
      (claim) =>
        !evidence.some(
          (date) =>
            date.month === claim.month &&
            date.day === claim.day &&
            (claim.year === undefined || date.year === claim.year),
        ),
    )
  ) {
    throw new LlmValidationFailure('unsupported-social-date');
  }
}
