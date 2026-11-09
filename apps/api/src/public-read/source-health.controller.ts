import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicSourceHealth } from './source-health';

export const PUBLIC_SOURCE_HEALTH = Symbol('PUBLIC_SOURCE_HEALTH');
export interface PublicSourceHealthPort {
  read(): Promise<unknown>;
}

// Unregistered Phase 4 transport; stored failures never leave the projection.
@Controller('api/admin/content/sources')
export class PublicSourceHealthController {
  constructor(
    @Inject(PUBLIC_SOURCE_HEALTH)
    private readonly sources: PublicSourceHealthPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    return readPublicSourceHealth(() => this.sources.read());
  }
}
