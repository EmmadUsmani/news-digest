// Offline saved-pool evaluation: no database, provider or network adapters.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  evaluateFixture,
  type RankingFixture,
} from '../apps/api/scripts/evaluate-ranking';

const root = new URL('../apps/api/test/fixtures/', import.meta.url);
const labels = JSON.parse(
  readFileSync(
    new URL('ranking-tech-2026-11-13-additional-events.json', root),
    'utf8',
  ),
) as {
  fixture: string;
  fixtureSha256: string;
  events: RankingFixture['events'];
};
const raw = readFileSync(new URL(labels.fixture, root));
assert.equal(
  createHash('sha256').update(raw).digest('hex'),
  labels.fixtureSha256,
);
const fixture = JSON.parse(raw.toString()) as RankingFixture;
const original = evaluateFixture(fixture);
const expanded = evaluateFixture({
  ...fixture,
  events: [...fixture.events, ...labels.events],
});
// Labels must not affect the production ranking path.
assert.deepEqual(expanded.selected, original.selected);
assert.equal(
  expanded.targetEvents,
  original.targetEvents + labels.events.length,
);
console.log(
  JSON.stringify({
    mode: 'offline-agent-labels',
    candidates: expanded.candidates,
    original: {
      targetEvents: original.targetEvents,
      eventRecall: original.eventRecall,
    },
    expanded: {
      targetEvents: expanded.targetEvents,
      eventRecall: expanded.eventRecall,
      missedEvents: expanded.missedEvents,
      addedEvents: expanded.eventDiagnostics.slice(fixture.events.length),
    },
    providerCalls: 0,
    productionSelectionChanged: false,
  }),
);
