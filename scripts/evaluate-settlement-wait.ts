// Offline, local admission counterfactuals from the Nov 12 ledger reconciliation.
// No database, secrets, timers, provider calls or production retry changes.
import assert from 'node:assert/strict';

import { modelBudgetAvailable } from '../apps/api/src/modules/curation/domain/budget';

const dailyCap = 650_000;
const fraction = 0.8;
const intervalMs = 250;
const maxWaitMs = 5_000;
// Candidate planning allowance, not a production deadline or measured bound.
// Three 60-second HTTP attempts + two <=10-second 429 backoffs.
const providerHeadroomMs = 200_000;
const queueHeadroomMs = 10_000;
const completionHeadroomMs = 90_000;
const startHeadroomMs =
  providerHeadroomMs + queueHeadroomMs + completionHeadroomMs;
type State = {
  modelUsed: number;
  sharedAvailable: number;
  existingPending: number;
  blocked: boolean;
};
type Change = { at: number; apply: (state: State) => void };
type Request = { id: string; estimate: number };
const worldX = { id: 'World X repair', estimate: 67_993 };
const usX = { id: 'U.S. X initial', estimate: 68_710 };
const worldBluesky = { id: 'World Bluesky initial', estimate: 66_448 };

function release(at: number, reserved: number, cost: number): Change {
  return {
    at,
    apply: (state) => {
      state.existingPending--;
      state.modelUsed -= reserved - cost;
      state.sharedAvailable += reserved - cost;
    },
  };
}

// Ordered requests represent competing atomic reservations, not parallel reads
// of the same headroom. All gates must be rechecked on every attempt.
function probe(
  initial: State,
  requests: Request[],
  changes: Change[],
  deadlineMs = 600_000,
  cancelledAtMs = Infinity,
) {
  const state = { ...initial };
  const waiting = [...requests];
  const outcomes: { id: string; status: string; waitedMs: number }[] = [];
  const events = [...changes].sort((a, b) => a.at - b.at);
  let attempts = 0;
  for (let at = 0; at <= maxWaitMs && waiting.length; at += intervalMs) {
    while (events.length && events[0].at <= at) events.shift()!.apply(state);
    for (const request of [...waiting]) {
      let status: string | undefined;
      // Preserve the proposed queue, logical-call and completion allowances.
      // The real queue is currently unbounded; production needs enforcement.
      if (at >= cancelledAtMs) status = 'cancelled';
      else if (at + startHeadroomMs >= deadlineMs) status = 'deadline';
      else {
        attempts++;
        const available = modelBudgetAvailable(
          dailyCap,
          state.modelUsed,
          fraction,
        );
        if (state.blocked || state.sharedAvailable < request.estimate)
          status = 'other-gate';
        else if (available >= request.estimate) {
          state.modelUsed += request.estimate;
          state.sharedAvailable -= request.estimate;
          // Newly admitted holds cannot be assumed to settle during this probe.
          status = 'admitted';
        } else if (state.existingPending === 0) status = 'no-existing-hold';
        else if (at === maxWaitMs) status = 'wait-exhausted';
      }
      if (status) {
        outcomes.push({ id: request.id, status, waitedMs: at });
        waiting.splice(waiting.indexOf(request), 1);
      }
    }
  }
  assert.equal(waiting.length, 0);
  assert.ok(state.sharedAvailable >= 0);
  assert.ok(state.modelUsed <= dailyCap * fraction);
  assert.ok(attempts <= requests.length * (maxWaitMs / intervalMs + 1));
  return { outcomes, attempts, state };
}

const first: State = {
  modelUsed: 305_843 + 146_461,
  sharedAvailable: 94_514,
  existingPending: 2,
  blocked: false,
};
const later: State = {
  modelUsed: 379_728 + 74_578,
  sharedAvailable: 80_767,
  existingPending: 1,
  blocked: false,
};
const cases = [
  {
    request: worldX,
    state: first,
    settlement: release(1_544, 73_183, 29_066),
    wait: 1_750,
  },
  {
    request: usX,
    state: { ...later, sharedAvailable: 82_099 },
    settlement: release(4_434, 74_578, 11_680),
    wait: 4_500,
  },
  {
    request: worldBluesky,
    state: later,
    settlement: release(2_660, 74_578, 11_680),
    wait: 2_750,
  },
];
const individual = cases.map(({ request, state, settlement, wait }) => {
  const result = probe(state, [request], [settlement]);
  assert.deepEqual(result.outcomes, [
    { id: request.id, status: 'admitted', waitedMs: wait },
  ]);
  return result.outcomes[0];
});

// Same later snapshot, both waiting: the released hold only funds one request.
const competing = [
  [usX, worldBluesky],
  [worldBluesky, usX],
].map((requests) => {
  const result = probe(later, requests, [release(2_660, 74_578, 11_680)]);
  assert.deepEqual(
    result.outcomes.map((o) => o.status),
    ['admitted', 'no-existing-hold'],
  );
  assert.equal(result.outcomes[0].id, requests[0].id);
  assert.equal(result.state.modelUsed, 391_408 + requests[0].estimate);
  return result.outcomes;
});
function expectStatus(
  state: State,
  events: Change[],
  status: string,
  deadline?: number,
  cancel?: number,
) {
  const result = probe(state, [worldBluesky], events, deadline, cancel);
  assert.equal(result.outcomes[0].status, status);
  return result;
}
expectStatus(later, [], 'wait-exhausted');
expectStatus(later, [release(5_001, 74_578, 11_680)], 'wait-exhausted');
expectStatus({ ...later, existingPending: 0 }, [], 'no-existing-hold');
expectStatus(later, [release(1_000, 74_578, 74_578)], 'no-existing-hold');
expectStatus(later, [release(1_000, 74_578, 80_000)], 'no-existing-hold');
expectStatus({ ...later, blocked: true }, [], 'other-gate');
expectStatus({ ...later, sharedAvailable: 1 }, [], 'other-gate');
expectStatus(
  later,
  [
    {
      at: 1_000,
      apply: (s) => {
        s.blocked = true;
      },
    },
  ],
  'other-gate',
);
expectStatus(
  later,
  [
    {
      at: 1_000,
      apply: (s) => {
        s.sharedAvailable = 1;
      },
    },
  ],
  'other-gate',
);
expectStatus(later, [], 'deadline', startHeadroomMs);
expectStatus(
  later,
  [release(2_660, 74_578, 11_680)],
  'deadline',
  startHeadroomMs + 2_000,
);
expectStatus(
  later,
  [release(2_660, 74_578, 11_680)],
  'cancelled',
  600_000,
  1_000,
);
// A single HTTP timeout does not cover rate-limit retries or slot admission.
expectStatus(later, [release(0, 74_578, 11_680)], 'deadline', 120_000);
const justEnough = probe(
  later,
  [worldBluesky],
  [release(0, 74_578, 11_680)],
  startHeadroomMs + 1,
);
assert.equal(justEnough.outcomes[0].status, 'admitted');
const edge = probe(later, [worldBluesky], [release(5_000, 74_578, 11_680)]);
assert.equal(edge.outcomes[0].waitedMs, 5_000);
assert.equal(edge.outcomes[0].status, 'admitted');
console.log(
  JSON.stringify({
    offline: true,
    intervalMs,
    maxWaitMs,
    providerHeadroomMs,
    queueHeadroomMs,
    completionHeadroomMs,
    individual,
    competing,
    controls: 15,
  }),
);
