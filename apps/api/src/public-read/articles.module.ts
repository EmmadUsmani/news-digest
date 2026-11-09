import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicArticlesReader } from '../modules/ingestion/database/public-articles.reader';
import {
  PUBLIC_ARTICLES,
  PublicArticlesController,
} from './articles.controller';

// Preparation only: main does not import this module. The caller owns the pool.
// Route authorization must be installed separately before public promotion.
@Module({})
export class PublicArticlesModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicArticlesModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public articles require system ownership and published readers',
      );
    return {
      module: PublicArticlesModule,
      controllers: [PublicArticlesController],
      providers: [
        {
          provide: PUBLIC_ARTICLES,
          useFactory: () => new PublicArticlesReader(getPool()),
        },
      ],
    };
  }
}
