import { type DynamicModule, Module } from '@nestjs/common';

import {
  PUBLIC_PREVIEWS,
  PublicPreviewsController,
  type PublicPreviewsPort,
} from './previews.controller';

// Not installed by the application or aggregate public-read module yet.
@Module({})
export class PublicPreviewsModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    createReader: () => PublicPreviewsPort,
  ): DynamicModule {
    const enabled = env.PUBLIC_MODE ?? '0';
    if (enabled !== '0' && enabled !== '1')
      throw new Error('Invalid public mode flag');
    if (enabled === '0') return { module: PublicPreviewsModule };
    if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
      throw new Error(
        'Public previews require system ownership and published readers',
      );
    return {
      module: PublicPreviewsModule,
      controllers: [PublicPreviewsController],
      providers: [{ provide: PUBLIC_PREVIEWS, useFactory: createReader }],
    };
  }
}
