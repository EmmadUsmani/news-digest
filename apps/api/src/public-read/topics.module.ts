import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicTopicsReader } from '../modules/topics/database/public-topics.reader';
import { PUBLIC_TOPICS, PublicTopicsController } from './topics.controller';

// Preparation only: main does not import this module. The caller owns the pool.
// Route authorization must be installed separately before public promotion.
@Module({})
export class PublicTopicsModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicTopicsModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public topics require system ownership and published readers',
      );
    return {
      module: PublicTopicsModule,
      controllers: [PublicTopicsController],
      providers: [
        {
          provide: PUBLIC_TOPICS,
          useFactory: () => new PublicTopicsReader(getPool()),
        },
      ],
    };
  }
}
