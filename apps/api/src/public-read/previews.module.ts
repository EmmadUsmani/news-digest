import { type DynamicModule, Module } from '@nestjs/common';

import {
  PUBLIC_PREVIEWS,
  PublicPreviewsController,
  type PublicPreviewsPort,
} from './previews.controller';

// Standalone transport for isolated rehearsals; application composition shares its repository.
@Module({})
export class PublicPreviewsModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
    createReader: () => PublicPreviewsPort,
  ): DynamicModule {
    if (!publicPreviewsEnabled(env)) return { module: PublicPreviewsModule };
    return {
      module: PublicPreviewsModule,
      controllers: [PublicPreviewsController],
      providers: [{ provide: PUBLIC_PREVIEWS, useFactory: createReader }],
    };
  }
}

export function publicPreviewsEnabled(
  env: Readonly<Record<string, string | undefined>>,
): boolean {
  const enabled = env.PUBLIC_MODE ?? '0';
  if (enabled !== '0' && enabled !== '1')
    throw new Error('Invalid public mode flag');
  if (enabled === '0') return false;
  if (env.SYSTEM_OWNERSHIP !== '1' || env.READER_PUBLISHED_ONLY !== '1')
    throw new Error(
      'Public previews require system ownership and published readers',
    );
  return true;
}
