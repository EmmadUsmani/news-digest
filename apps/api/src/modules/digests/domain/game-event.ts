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

function gameIdentity(title: string): string | null | false {
  const text = title.normalize('NFKC').toLowerCase();
  const named = teams.flatMap((aliases, index) =>
    aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(text))
      ? [index]
      : [],
  );
  if (named.length !== 2) return null;
  // Refuse uncertain or historical game claims before lexical fallback. A fresh
  // publication date alone cannot establish when the reported game happened.
  if (
    /[?？]|\b(preview|prediction|predicted|odds|rematch|last season|last year|years? ago|previously|could|might|would|if|not|never)\b/.test(
      text,
    )
  )
    return false;
  // Accept “136–111” and “Cavaliers 136, Bucks 111”, only once per title.
  const scores = [
    ...text.matchAll(/\b(\d{2,3})\s*(?:[-–—]|,\s*[a-z ]+)\s*(\d{2,3})\b/g),
  ];
  if (scores.length === 0) return null;
  if (scores.length !== 1) return false;
  const score = scores[0].slice(1).map(Number);
  if (score.some((value) => value < 60 || value > 200) || score[0] === score[1])
    return false;
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
  // Team-score pairs explicitly assign each value, even in loser-first recaps.
  const teamPattern = (team: number) => `(?:${teams[team].join('|')})`;
  const assigned = new RegExp(
    `\\b${teamPattern(first)}\\s+${score[0]}\\s*,\\s*${teamPattern(second)}\\s+${score[1]}\\b`,
  ).test(text);
  if (!assigned) {
    // A bare score is conventionally winner-first, but only accept a clear
    // winning action. Loss-first and matchup-only wording cannot assign it.
    if (score[0] < score[1]) return false;
    const between = text.slice(position(first), position(second));
    if (
      !/\b(win|wins|beat|beats|defeat|defeats|tame|tames|haunt|haunts)\b/.test(
        between,
      )
    )
      return false;
    if (/\b(lose|loses|loss|fall|falls|fell|lost|beaten|defeated)\b/.test(text))
      return false;
  }
  return [
    [first, score[0]],
    [second, score[1]],
  ]
    .sort((left, right) => left[0] - right[0])
    .map(([team, points]) => `${team}:${points}`)
    .join('|');
}

export function sameEventWithGameScore(a: Candidate, b: Candidate): boolean {
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  if (!Number.isFinite(delta)) return false;
  const left = gameIdentity(a.title);
  const right = gameIdentity(b.title);
  if (left === false || right === false) return false;
  // Explicit outcomes take precedence over lexical overlap (which sorts numbers).
  if (left !== null || right !== null)
    return delta <= 18 * 3600000 && left !== null && left === right;
  return sameEvent(a, b);
}
