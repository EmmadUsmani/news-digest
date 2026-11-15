// Offline measurement of a saved request through production reservation logic.
// No database, secrets, provider adapter, runtime wiring or ledger writes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { z } from 'zod';

import { simulateStagedScheduling } from '../apps/api/scripts/experiments/staged-scheduling';
import { logger } from '../apps/api/src/libs/observability/logging';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { LlmValidationFailure } from '../apps/api/src/modules/curation/application/validation-failure';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';

async function main() {
  const fixture = JSON.parse(
    readFileSync('apps/api/test/fixtures/llm/nba-2026-11-12-raw.json', 'utf8'),
  ) as { request: LlmRequest };
  const request = fixture.request;
  const schemaFailure = z
    .object({
      required: z.string(),
      long: z.string().max(1),
      short: z.string().min(2),
      value: z.enum(['allowed']),
    })
    .strict()
    .safeParse({ long: 'xx', short: '', value: 'other', extra: true });
  assert.equal(schemaFailure.success, false);
  const failures = [
    { name: 'invalid-json', text: '{', error: undefined },
    { name: 'validator-error', text: '{}', error: new Error('synthetic') },
    { name: 'schema-all-hints', text: '{}', error: schemaFailure.error },
    {
      name: 'invalid-selection',
      text: '{}',
      error: new LlmValidationFailure('invalid-selection'),
    },
    ...(
      ['headline', 'summary', 'whyItMatters', 'rationale', 'brief'] as const
    ).map((field) => ({
      name: `unsupported-absence-${field}`,
      text: '{}',
      error: new LlmValidationFailure('unsupported-absence', field),
    })),
  ];
  const measurements = [];
  for (const failure of failures) {
    const holds: number[] = [];
    const calls: LlmRequest[] = [];
    let settlements = 0;
    const llm = new BudgetedLlm(
      {
        complete(current) {
          calls.push(current);
          return Promise.resolve({
            text: failure.text,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          });
        },
      },
      {
        reserve(current, estimate) {
          assert.equal(settlements, holds.length);
          assert.equal(current.maxOutputTokens, request.maxOutputTokens);
          holds.push(estimate);
          return Promise.resolve(String(holds.length));
        },
        cached: () => Promise.resolve(undefined),
        settle: () => {
          settlements++;
          return Promise.resolve();
        },
        cache: () => Promise.reject(new Error('Invalid output cannot cache')),
        fail: () => Promise.reject(new Error('Synthetic provider cannot fail')),
      },
      logger.child({}, { level: 'silent' }),
    );
    const result = await llm.json(request, () => {
      throw failure.error;
    });
    assert.equal(result, null);
    assert.equal(calls.length, 2);
    assert.equal(settlements, 2);
    assert.equal(calls[0].prompt, request.prompt);
    assert.equal(calls[1].instructions, request.instructions);
    assert.ok(calls[1].prompt.startsWith(request.prompt));
    assert.ok(holds[1] > holds[0]);
    measurements.push({
      failure: failure.name,
      initialMicros: holds[0],
      repairMicros: holds[1],
      envelopeMicros: holds[0] + holds[1],
      addedRepairBytes:
        Buffer.byteLength(calls[1].prompt) - Buffer.byteLength(request.prompt),
    });
  }
  const maximum = measurements.reduce((a, b) =>
    a.envelopeMicros > b.envelopeMicros ? a : b,
  );
  // A supplied capacity counterexample, not a historical ledger reconstruction.
  // Even unlimited waiting cannot admit an envelope larger than idle capacity.
  const capacity = maximum.envelopeMicros - 1;
  const jobs = [
    {
      id: 'initial',
      after: [],
      durationMs: 1,
      reservation: maximum.initialMicros,
      cost: 0,
    },
    {
      id: 'repair',
      after: ['initial'],
      durationMs: 1,
      reservation: maximum.repairMicros,
      cost: 0,
    },
  ];
  const sequential = simulateStagedScheduling(jobs, capacity);
  const owned = simulateStagedScheduling(
    jobs.map((job) => ({
      ...job,
      owner: 'nba',
      releaseOwner: job.id === 'repair',
    })),
    capacity,
    0,
    { nba: maximum.envelopeMicros },
    60_000,
  );
  assert.equal(
    sequential.trace.filter((row) => row.event === 'settle').length,
    2,
  );
  assert.ok(
    owned.trace.some((row) => row.id === 'initial' && row.event === 'refused'),
  );
  assert.equal(owned.elapsedMs, 0);
  console.log(
    JSON.stringify(
      {
        fixture: 'nba-2026-11-12-raw',
        pricing: request.model,
        measurements,
        capacityCounterexample: {
          capacityMicros: capacity,
          sequentialAdmitted: true,
          ownedAdmitted: false,
          suppliedWaitMs: 60_000,
        },
        note: 'Saved initial request and prices; synthetic validation failures and zero usage. Sequential reservation sums are proposed envelopes, not actual charges or historical simultaneous holds. No actual waiting limit or speedup established.',
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
