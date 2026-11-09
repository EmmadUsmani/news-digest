import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicSourceHealthReader } from '../modules/ingestion/database/public-source-health.reader';
import {
  PUBLIC_SOURCE_HEALTH,
  PublicSourceHealthController,
} from './source-health.controller';

// Preparation only: main does not import this module. The caller owns the pool.
// Route authorization must be installed separately before public promotion.
@Module({})
export class PublicSourceHealthModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicSourceHealthModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public source health requires system ownership and published readers',
      );
    return {
      module: PublicSourceHealthModule,
      controllers: [PublicSourceHealthController],
      providers: [
        {
          provide: PUBLIC_SOURCE_HEALTH,
          useFactory: () => new PublicSourceHealthReader(getPool()),
        },
      ],
    };
  }
}
