import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicSourceHealthReader } from '../modules/ingestion/database/public-source-health.reader';
import {
  PUBLIC_SOURCE_HEALTH,
  PublicSourceHealthController,
} from './source-health.controller';

// Application composition owns the pool; isolated readers may borrow one.
@Module({})
export class PublicSourceHealthModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
    closePoolOnShutdown = false,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicSourceHealthModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public source health requires system ownership and published readers',
      );
    let pool: Pool | undefined;
    return {
      module: PublicSourceHealthModule,
      controllers: [PublicSourceHealthController],
      providers: [
        {
          provide: Symbol('PUBLIC_SOURCEHEALTH_POOL_LIFECYCLE'),
          useValue: {
            async onModuleDestroy() {
              if (closePoolOnShutdown) await pool?.end();
            },
          },
        },
        {
          provide: PUBLIC_SOURCE_HEALTH,
          useFactory: () => new PublicSourceHealthReader((pool ??= getPool())),
        },
      ],
    };
  }
}
