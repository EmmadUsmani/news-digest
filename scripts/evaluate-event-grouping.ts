import { readFileSync } from 'node:fs';

import { evaluateEventGrouping } from '../apps/api/scripts/evaluate-event-grouping';

// Offline only. Saved memberships contain window names mapped to arrays of ID groups.
const args = process.argv.slice(2);
const definition =
  args[0] === '--later-gaming'
    ? 'later-gaming'
    : args[0] === '--same-story'
      ? 'same-story'
      : 'strict-event';
if (definition !== 'strict-event') args.shift();
if (args.length && (args.length !== 2 || args[0] !== '--memberships'))
  throw new Error(
    'Usage: tsx scripts/evaluate-event-grouping.ts [--same-story | --later-gaming] [--memberships file.json]',
  );
let memberships: Record<string, string[][]> | undefined;
if (args.length) {
  const value: unknown = JSON.parse(readFileSync(args[1], 'utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(
      'Saved memberships must be an object keyed by recorded window',
    );
  memberships = value as Record<string, string[][]>;
}
console.log(
  JSON.stringify(
    evaluateEventGrouping(undefined, memberships, definition),
    null,
    2,
  ),
);
