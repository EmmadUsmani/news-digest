import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareAccountHttp } from '../src/modules/accounts/adapters/account-bootstrap';

void test('account HTTP bootstrap stays lazy when disabled and requires explicit proxy trust before resources', () => {
  const forbidden = (): never => {
    throw new Error('dependencies opened');
  };
  assert.equal(prepareAccountHttp({}, forbidden), null);
  assert.equal(
    prepareAccountHttp(
      { ACCOUNTS_ENABLED: '0', ACCOUNT_TRUSTED_PROXY_PEERS: 'invalid' },
      forbidden,
    ),
    null,
  );
  for (const peers of [
    undefined,
    '',
    ' ',
    '127.0.0.1,',
    ',::1',
    'hostname',
    '0.0.0.0/0',
  ])
    assert.throws(
      () =>
        prepareAccountHttp(
          { ACCOUNTS_ENABLED: '1', ACCOUNT_TRUSTED_PROXY_PEERS: peers },
          forbidden,
        ),
      /proxy/i,
    );
  assert.throws(
    () => prepareAccountHttp({ ACCOUNTS_ENABLED: 'true' }, forbidden),
    /enable flag/,
  );
  assert.throws(
    () =>
      prepareAccountHttp(
        { ACCOUNTS_ENABLED: '1', ACCOUNT_TRUSTED_PROXY_PEERS: '127.0.0.1,::1' },
        forbidden,
      ),
    /Invalid URL/,
  );
});
