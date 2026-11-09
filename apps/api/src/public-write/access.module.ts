import { Module } from '@nestjs/common';

import { ACCESS_HTTP, configuredAccessHttpProvider } from './access-provider';

@Module({
  providers: [configuredAccessHttpProvider(process.env)],
  exports: [ACCESS_HTTP],
})
export class AccessModule {}
