import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicStatus } from './status';

export const PUBLIC_STATUS = Symbol('PUBLIC_STATUS');
export interface PublicStatusPort {
  read(): Promise<unknown>;
}

// Prepared transport: application composition must replace the legacy route
// before installing this controller. Route authorization remains a separate gate.
@Controller('api/admin/status')
export class PublicStatusController {
  constructor(
    @Inject(PUBLIC_STATUS) private readonly status: PublicStatusPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    return readPublicStatus(() => this.status.read());
  }
}
