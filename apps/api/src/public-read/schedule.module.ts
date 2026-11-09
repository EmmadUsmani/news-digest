import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicScheduleReader } from '../modules/profiles/database/public-schedule.reader';
import {
  PUBLIC_SCHEDULE,
  PublicScheduleController,
} from './schedule.controller';

// Preparation only: main does not import this module. The caller owns the pool.
// Route authorization must be installed separately before public promotion.
@Module({})
export class PublicScheduleModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicScheduleModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public schedule requires system ownership and published readers',
      );
    return {
      module: PublicScheduleModule,
      controllers: [PublicScheduleController],
      providers: [
        {
          provide: PUBLIC_SCHEDULE,
          useFactory: () => new PublicScheduleReader(getPool()),
        },
      ],
    };
  }
}
