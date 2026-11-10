import { type DynamicModule, Module } from '@nestjs/common';

import {
  PUBLIC_STATUS,
  PublicStatusController,
  type PublicStatusPort,
} from './status.controller';

// Not installed by the application or aggregate public-read module yet.
@Module({})
export class PublicStatusModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    createReader: () => PublicStatusPort,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicStatusModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public status requires system ownership and published readers',
      );
    return {
      module: PublicStatusModule,
      controllers: [PublicStatusController],
      providers: [{ provide: PUBLIC_STATUS, useFactory: createReader }],
    };
  }
}
