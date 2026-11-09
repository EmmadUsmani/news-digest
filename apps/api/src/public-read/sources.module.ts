import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicSourcesReader } from '../modules/topics/database/public-sources.reader';
import {
  PUBLIC_SOURCE_CATALOG,
  PublicSourcesController,
} from './sources.controller';

// Preparation only: main does not import this module. The caller owns the pool.
// Route authorization must be installed separately before public promotion.
@Module({})
export class PublicSourcesModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicSourcesModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public sources require system ownership and published readers',
      );
    return {
      module: PublicSourcesModule,
      controllers: [PublicSourcesController],
      providers: [
        {
          provide: PUBLIC_SOURCE_CATALOG,
          useFactory: () => new PublicSourcesReader(getPool()),
        },
      ],
    };
  }
}
