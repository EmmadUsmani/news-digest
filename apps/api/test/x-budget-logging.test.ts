import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLogger } from '../src/libs/observability/logging';
import { searchX } from '../src/modules/social/application/search-x';
import type { XDiscoveryLedger } from '../src/modules/social/domain/x-discovery-ledger.port';
import { XSearchError } from '../src/modules/social/domain/x-search.port';

void test('X budget logs committed decisions, charges and safe failure holds without request content', async () => {
  for (const scenario of [
    'success',
    'refused',
    'rejected',
    'credits-depleted',
    'uncertain',
    'reserve-error',
    'settle-error',
    'fail-error',
    'save-error',
    'large-input',
  ] as const) {
    const lines: string[] = [];
    const log = createLogger(
      'test',
      {
        write: (line) => {
          lines.push(line);
        },
      },
      [],
    );
    let searched = false;
    let saved = false;
    const ledger: XDiscoveryLedger = {
      reserve: async () => {
        if (scenario === 'reserve-error')
          throw new Error('private ledger error');
        return scenario === 'refused' ? null : 'call-id';
      },
      settle: async () => {
        if (scenario === 'settle-error')
          throw new Error('private settlement error');
      },
      fail: async () => {
        if (scenario === 'fail-error') throw new Error('private failure error');
      },
    };
    const work = searchX(
      'topic-id',
      'run-id',
      {
        topic: 'private topic',
        guidance: 'private guidance',
        handles: ['private_handle'],
        fromDate: '2026-11-01',
        toDate: '2026-11-02',
      },
      {
        search: async () => {
          searched = true;
          if (scenario === 'uncertain' || scenario === 'fail-error')
            throw new Error('private provider error');
          if (scenario === 'rejected' || scenario === 'credits-depleted')
            throw new XSearchError(scenario);
          return {
            links: [],
            usage: {
              inputTokens: scenario === 'large-input' ? 200000 : 1000,
              outputTokens: 100,
              postsFetched: 2,
              profilesFetched: 0,
            },
          };
        },
      },
      ledger,
      {
        save: async () => {
          saved = true;
          if (scenario === 'save-error')
            throw new Error('private persistence error');
        },
      },
      {
        inputPerMillion: 1.25,
        outputPerMillion: 2.5,
        perPost: 0.005,
        perProfile: 0.01,
      },
      '2026-11-02',
      undefined,
      log,
    );
    if (scenario.endsWith('-error')) await assert.rejects(work);
    else await work;
    const entries = lines.map((line) => JSON.parse(line));
    assert.ok(!lines.join('').includes('private'), scenario);
    if (scenario === 'reserve-error') {
      assert.equal(entries.length, 0);
      continue;
    }
    assert.equal(entries[0].event, 'budget.decision');
    assert.equal(
      entries[0].outcome,
      scenario === 'refused' ? 'refused' : 'admitted',
    );
    assert.equal(entries[0].estimateMicros, 100000);
    assert.equal(entries[0].runId, 'run-id');
    assert.equal(entries[0].topic, 'topic-id');
    assert.equal(entries[0].searchType, 'account-list');
    if (scenario === 'refused') {
      assert.equal(searched, false);
      assert.equal(entries.length, 1);
    } else if (['success', 'save-error', 'large-input'].includes(scenario)) {
      assert.equal(entries[1].event, 'budget.settlement');
      assert.equal(
        entries[1].costMicros,
        scenario === 'large-input' ? 510500 : 11500,
      );
      assert.equal(saved, true);
    } else if (scenario === 'settle-error' || scenario === 'fail-error') {
      assert.equal(entries.length, 1);
      assert.equal(saved, false);
    } else {
      assert.equal(entries[1].event, 'budget.failure');
      assert.equal(
        entries[1].outcome,
        scenario === 'uncertain' ? 'held-uncertain' : 'released',
      );
      assert.equal(entries[1].providerBlocked, scenario === 'credits-depleted');
      assert.equal(saved, false);
    }
  }
});
