import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicArticlesReader } from '../modules/ingestion/database/public-articles.reader';
import {
  PUBLIC_ARTICLES,
  PublicArticlesController,
} from './articles.controller';

// Application composition owns the pool; isolated readers may borrow one.
@Module({})
export class PublicArticlesModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
    closePoolOnShutdown = false,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicArticlesModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public articles require system ownership and published readers',
      );
    let pool: Pool | undefined;
    return {
      module: PublicArticlesModule,
      controllers: [PublicArticlesController],
      providers: [
        {
          provide: Symbol('PUBLIC_ARTICLES_POOL_LIFECYCLE'),
          useValue: {
            async onModuleDestroy() {
              if (closePoolOnShutdown) await pool?.end();
            },
          },
        },
        {
          provide: PUBLIC_ARTICLES,
          useFactory: () => new PublicArticlesReader((pool ??= getPool())),
        },
      ],
    };
  }
}
