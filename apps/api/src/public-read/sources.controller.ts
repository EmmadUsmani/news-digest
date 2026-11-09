import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicSourceCatalog } from './settings';

export const PUBLIC_SOURCE_CATALOG = Symbol('PUBLIC_SOURCE_CATALOG');
export interface PublicSourceCatalogPort {
  read(): Promise<unknown>;
}

// Unregistered Phase 4 transport; never forward configured feed URLs.
@Controller('api/admin/topics/sources')
export class PublicSourcesController {
  constructor(
    @Inject(PUBLIC_SOURCE_CATALOG)
    private readonly sources: PublicSourceCatalogPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    return readPublicSourceCatalog(() => this.sources.read());
  }
}
