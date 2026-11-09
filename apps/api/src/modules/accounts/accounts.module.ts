import { Module } from '@nestjs/common';

import { prepareStoredAccountHttp } from './adapters/account-storage';

export const ACCOUNT_HTTP = Symbol('ACCOUNT_HTTP');

export function accountHttpProvider(
  prepare = () => prepareStoredAccountHttp(process.env),
) {
  return {
    provide: ACCOUNT_HTTP,
    useFactory: () => {
      const storage = prepare();
      return {
        middleware: storage.middleware,
        onModuleDestroy: () => storage.close(),
      };
    },
  };
}

@Module({
  providers: [accountHttpProvider()],
  exports: [ACCOUNT_HTTP],
})
export class AccountsModule {}

export type AccountHttpRuntime = {
  middleware: ReturnType<typeof prepareStoredAccountHttp>['middleware'];
};
