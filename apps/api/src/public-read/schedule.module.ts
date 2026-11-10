import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicScheduleReader } from '../modules/profiles/database/public-schedule.reader';
import {
  PUBLIC_SCHEDULE,
  PublicScheduleController,
} from './schedule.controller';

// The application owns its pool; isolated composition may borrow a caller pool.
@Module({})
export class PublicScheduleModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
    closePoolOnShutdown = false,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicScheduleModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public schedule requires system ownership and published readers',
      );
    let pool: Pool | undefined;
    return {
      module: PublicScheduleModule,
      controllers: [PublicScheduleController],
      providers: [
        {
          provide: Symbol('PUBLIC_SCHEDULE_POOL_LIFECYCLE'),
          useValue: {
            async onModuleDestroy() {
              if (closePoolOnShutdown) await pool?.end();
            },
          },
        },
        {
          provide: PUBLIC_SCHEDULE,
          useFactory: () => new PublicScheduleReader((pool ??= getPool())),
        },
      ],
    };
  }
}
