import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  ACCOUNT_HTTP,
  accountHttpProvider,
  type AccountHttpRuntime,
} from '../src/modules/accounts/accounts.module';
import { prepareStoredAccountHttp } from '../src/modules/accounts/adapters/account-storage';

void test('Nest owns gated account startup and closes account storage on shutdown', async () => {
  let closed = 0;
  @Module({
    providers: [
      accountHttpProvider(() => {
        const storage = prepareStoredAccountHttp({ ACCOUNTS_ENABLED: '0' });
        return {
          ...storage,
          close: async () => {
            await storage.close();
            closed++;
          },
        };
      }),
    ],
  })
  class TestModule {}
  const app = await NestFactory.createApplicationContext(TestModule, {
    logger: false,
  });
  assert.equal(app.get<AccountHttpRuntime>(ACCOUNT_HTTP).middleware, null);
  await app.close();
  assert.equal(closed, 1);
});

void test('Nest refuses enabled accounts without verified proxy configuration', async () => {
  @Module({
    providers: [
      accountHttpProvider(() =>
        prepareStoredAccountHttp({ ACCOUNTS_ENABLED: '1' }),
      ),
    ],
  })
  class TestModule {}
  await assert.rejects(
    NestFactory.createApplicationContext(TestModule, {
      logger: false,
      abortOnError: false,
    }),
    /Verified account proxy peers required/,
  );
});
