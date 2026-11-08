import assert from 'node:assert/strict';
import test from 'node:test';

import { SignupPolicy } from '../src/modules/accounts/application/signup-policy';

void test('signup configuration refuses unknown modes and open stand-in delivery', () => {
  for (const mode of ['', 'OPEN', 'unexpected', 'open'])
    assert.throws(
      () => new SignupPolicy(mode, 'stand-in', async () => false, new Set()),
    );
  const policy = new SignupPolicy(
    'open',
    'provider',
    async () => false,
    new Set(),
  );
  assert.equal(policy.mode, 'open');
});

void test('closed signup preserves existing login; invite bootstraps only configured admins', async () => {
  const seen: string[] = [];
  const existing = async (email: string) => {
    seen.push(email);
    return email === 'reader@example.com';
  };
  for (const mode of ['off', 'invite'] as const) {
    const policy = new SignupPolicy(
      mode,
      'stand-in',
      existing,
      new Set(['owner@example.com']),
    );
    assert.equal(await policy.eligible(' Reader@Example.COM '), true);
    assert.equal(await policy.eligible('friend@example.com'), false);
    assert.equal(await policy.eligible('owner@example.com'), mode === 'invite');
    assert.equal(await policy.eligible('owner@example.com.evil.test'), false);
    assert.equal(await policy.eligible('invalid'), false);
  }
  assert.ok(seen.includes('reader@example.com'));
  assert.ok(!seen.includes('invalid'));
});

void test('eligibility fails closed on lookup failure and rejects malformed open signups', async () => {
  const policy = new SignupPolicy(
    'invite',
    'stand-in',
    async () => {
      throw new Error('database unavailable');
    },
    new Set(['owner@example.com']),
  );
  assert.equal(await policy.eligible('owner@example.com'), false);
  const open = new SignupPolicy(
    'open',
    'provider',
    async () => {
      throw new Error('unused');
    },
    new Set(),
  );
  assert.equal(await open.eligible('new@example.com'), true);
  for (const email of [
    '',
    'a@@example.com',
    'a b@example.com',
    `${'a'.repeat(250)}@example.com`,
  ])
    assert.equal(await open.eligible(email), false);
});
