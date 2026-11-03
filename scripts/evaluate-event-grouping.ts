import { evaluateEventGrouping } from '../apps/api/scripts/evaluate-event-grouping';
import { sameEventWithGameScore } from '../apps/api/src/modules/digests/domain/game-event';

console.log(
  JSON.stringify(
    evaluateEventGrouping(
      process.argv.includes('--game-scores')
        ? sameEventWithGameScore
        : undefined,
    ),
    null,
    2,
  ),
);
