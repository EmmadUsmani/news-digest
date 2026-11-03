import { sameEvent } from './cluster';
import type { Candidate } from './rank';

// Explicitly opt-in: no production caller until scheduled evidence is acknowledged.
// Require two named teams and the complete score; team overlap alone is insufficient.
const teams = [
  ['hawks'],
  ['celtics'],
  ['nets'],
  ['hornets'],
  ['bulls'],
  ['cavaliers', 'cavs'],
  ['mavericks', 'mavs'],
  ['nuggets'],
  ['pistons'],
  ['warriors'],
  ['rockets'],
  ['pacers'],
  ['clippers'],
  ['lakers'],
  ['grizzlies'],
  ['heat'],
  ['bucks'],
  ['timberwolves', 'wolves'],
  ['pelicans'],
  ['knicks'],
  ['thunder'],
  ['magic'],
  ['76ers', 'sixers'],
  ['suns'],
  ['trail blazers', 'blazers'],
  ['kings'],
  ['spurs'],
  ['raptors'],
  ['jazz'],
  ['wizards'],
];

function gameIdentity(title: string): string | null {
  const text = title.normalize('NFKC').toLowerCase();
  const named = teams.flatMap((aliases, index) =>
    aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(text))
      ? [index]
      : [],
  );
  if (/\b(preview|prediction|predicted|odds|rematch|last season)\b/.test(text))
    return null;
  if (named.length !== 2) return null;
  // Accept “136–111” and “Cavaliers 136, Bucks 111”, only once per title.
  const scores = [
    ...text.matchAll(/\b(\d{2,3})\s*(?:[-–—]|,\s*[a-z ]+)\s*(\d{2,3})\b/g),
  ];
  if (scores.length !== 1) return null;
  const score = scores[0].slice(1).map(Number);
  if (score.some((value) => value < 60 || value > 200) || score[0] === score[1])
    return null;
  // Preserve the winning team: reversed outcomes are distinct games.
  const position = (team: number) =>
    Math.min(
      ...teams[team].map((alias) => {
        const match = new RegExp(`\\b${alias}\\b`).exec(text);
        return match?.index ?? Infinity;
      }),
    );
  const first = position(named[0]) < position(named[1]) ? named[0] : named[1];
  const second = named.find((team) => team !== first)!;
  return `${first}:${score[0]}|${second}:${score[1]}`;
}

export function sameEventWithGameScore(a: Candidate, b: Candidate): boolean {
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  if (!Number.isFinite(delta)) return false;
  if (sameEvent(a, b)) return true;
  if (delta > 18 * 3600000) return false;
  const left = gameIdentity(a.title);
  return left !== null && left === gameIdentity(b.title);
}
