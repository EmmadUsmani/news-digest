import { type DynamicModule, Module } from '@nestjs/common';
import type { Pool } from 'pg';

import { PublicArticlesModule } from './articles.module';
import { PublicScheduleModule } from './schedule.module';
import { PublicSourceHealthModule } from './source-health.module';
import { PublicSourcesModule } from './sources.module';
import { PublicTopicsModule } from './topics.module';

// Preparation only: main must not install alongside the legacy controllers.
// Authorization and the remaining response audits are separate rollout gates.
@Module({})
export class PublicReadModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    getPool: () => Pool,
  ): DynamicModule {
    // Every child validates prerequisites before Nest can open any storage.
    // All readers share one caller-owned pool; closing Nest must not close it.
    let pool: Pool | undefined;
    const sharedPool = () => (pool ??= getPool());
    return {
      module: PublicReadModule,
      imports: [
        PublicScheduleModule.prepare(env, sharedPool),
        PublicTopicsModule.prepare(env, sharedPool),
        PublicSourcesModule.prepare(env, sharedPool),
        PublicSourceHealthModule.prepare(env, sharedPool),
        PublicArticlesModule.prepare(env, sharedPool),
      ],
    };
  }
}
