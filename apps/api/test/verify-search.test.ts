import assert from 'node:assert/strict';
import { test } from 'node:test';

import { verifySearch } from '../src/modules/social/application/verify-search';
import type { XSearchRequest } from '../src/modules/social/domain/x-search.port';

const request = { topic: 'AI' } as XSearchRequest;
const result = { state: 'completed', callId: 'parent' };

void test('scheduled open verification completes only after the bounded pass', async () => {
  const events: string[] = [];
  await verifySearch(
    result,
    request,
    '2026-11-03',
    async (id) => {
      events.push(`verify:${id}`);
      return { verificationErrors: 0 };
    },
    async (id) => {
      events.push(`complete:${id}`);
    },
  );
  assert.deepEqual(events, ['verify:parent', 'complete:parent']);
});

void test('blocked, failed, manual and secondary searches cannot unlock open admission', async () => {
  let verified = 0;
  const verify = async () => {
    verified++;
    return { verificationErrors: 0 };
  };
  const complete = async () => {
    assert.fail('Unexpected completion');
  };
  for (const state of ['budget-blocked', 'failed'])
    await verifySearch({ state }, request, '2026-11-03', verify, complete);
  await verifySearch(result, request, undefined, verify, complete);
  await verifySearch(
    result,
    { ...request, handles: ['OpenAI'] },
    '2026-11-03',
    verify,
    complete,
  );
  await verifySearch(
    result,
    {
      ...request,
      reactionStory: {} as NonNullable<XSearchRequest['reactionStory']>,
    },
    '2026-11-03',
    verify,
    complete,
  );
  assert.equal(verified, 3);
});

void test('verification errors and persistence failures leave admission closed', async () => {
  const complete = async () => {
    assert.fail('Unexpected completion');
  };
  await verifySearch(
    result,
    request,
    '2026-11-03',
    async () => ({ verificationErrors: 1 }),
    complete,
  );
  await assert.rejects(
    verifySearch(
      result,
      request,
      '2026-11-03',
      async () => {
        throw new Error('Storage unavailable');
      },
      complete,
    ),
    /Storage unavailable/,
  );
  await assert.rejects(
    verifySearch(
      result,
      request,
      '2026-11-03',
      async () => ({ verificationErrors: 0 }),
      async () => {
        throw new Error('Ledger unavailable');
      },
    ),
    /Ledger unavailable/,
  );
});
