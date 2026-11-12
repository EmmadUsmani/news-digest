import assert from 'node:assert/strict';
import { test } from 'node:test';

import { replayNbaRejections } from '../scripts/replay-nba-rejections';

void test('Nov 12 recorded NBA outputs replay through production validation without provider access', async () => {
  const replay = await replayNbaRejections();
  assert.equal(replay.editionId, 'b1be5a12-2972-4eeb-9bff-82cbb10c1b07');
  assert.deepEqual(
    replay.results.map((r) => [r.model, r.attempt, r.validated, r.failure]),
    [
      [
        'claude-sonnet-5-5',
        'initial',
        false,
        { category: 'unsupported-absence', field: 'summary' },
      ],
      [
        'claude-sonnet-5-5',
        'repair',
        false,
        { category: 'unsupported-absence', field: 'summary' },
      ],
      [
        'claude-haiku-5-5',
        'initial',
        false,
        { category: 'invalid-selection', field: undefined },
      ],
      [
        'claude-haiku-5-5',
        'repair',
        false,
        { category: 'unsupported-absence', field: 'summary' },
      ],
    ],
  );
  // Pin the additional failures that a Curry-summary-only fix would conceal.
  assert.deepEqual(
    replay.results.map((r) => r.absenceFailures.map((f) => f.field)),
    [
      ['summary', 'summary', 'brief'],
      ['summary', 'brief'],
      ['summary'],
      ['summary', 'brief'],
    ],
  );
  assert.match(replay.results[0].absenceFailures[1].text, /No update on AR/);
  assert.match(
    replay.results[3].absenceFailures[1].text,
    /Golden State is bracing/,
  );
});
