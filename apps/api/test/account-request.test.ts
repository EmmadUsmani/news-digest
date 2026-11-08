import assert from 'node:assert/strict';
import test from 'node:test';

import { AccountRequestBoundary } from '../src/modules/accounts/adapters/account-request';

const origin = 'https://news-digest.exe.xyz';
const boundary = new AccountRequestBoundary(origin);

void test('account writes require the exact configured origin and JSON', () => {
  for (const type of ['application/json', 'application/json; charset=utf-8'])
    assert.equal(boundary.acceptsWrite(origin, type), true);
  for (const other of [
    undefined,
    null,
    'null',
    `${origin}/`,
    `${origin}.evil.test`,
    'http://news-digest.exe.xyz',
    [origin],
  ])
    assert.equal(boundary.acceptsWrite(other, 'application/json'), false);
  for (const type of [
    undefined,
    ['application/json'],
    'text/plain',
    'application/jsonp',
    'application/json; charset=utf-8; boundary=x',
  ])
    assert.equal(boundary.acceptsWrite(origin, type), false);
  for (const invalid of [
    'http://localhost',
    `${origin}/`,
    `${origin}/path`,
    'https://user:pass@news-digest.exe.xyz',
  ])
    assert.throws(() => new AccountRequestBoundary(invalid));
});

void test('login bodies cannot supply identities or permissions; malformed guesses reach attempt accounting', () => {
  assert.deepEqual(
    boundary.loginPayload({ email: 'reader@example.com' }, false),
    { email: 'reader@example.com', code: null },
  );
  assert.deepEqual(
    boundary.loginPayload({ email: 'reader@example.com', code: 'bad' }, true),
    { email: 'reader@example.com', code: 'bad' },
  );
  for (const body of [
    null,
    [],
    'email',
    {},
    { email: 5 },
    { email: 'x'.repeat(255) },
    { email: 'reader@example.com', userId: 'owner' },
    { email: 'reader@example.com', isAdmin: true },
    Object.create({ email: 'reader@example.com' }),
  ])
    assert.equal(boundary.loginPayload(body, false), null);
  for (const code of [null, 123456, 'x'.repeat(65)])
    assert.equal(
      boundary.loginPayload({ email: 'reader@example.com', code }, true),
      null,
    );
});

void test('session parsing rejects ambiguity, encoding and malformed tokens', () => {
  const token = 'a'.repeat(43);
  const cookie = `__Host-reader_session=${token}`;
  assert.equal(
    boundary.sessionToken(`other=value; ${cookie}; another=value`),
    token,
  );
  for (const invalid of [
    undefined,
    [cookie],
    '',
    `${cookie}; ${cookie}`,
    `${cookie}=`,
    `__Host-reader_session=%61${token.slice(1)}`,
    `reader_session=${token}`,
    `__Host-reader_session`,
    'x'.repeat(8193),
  ])
    assert.equal(boundary.sessionToken(invalid), null);
});
