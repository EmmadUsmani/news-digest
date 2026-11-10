import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicSchedule } from './settings';

export const PUBLIC_SCHEDULE = Symbol('PUBLIC_SCHEDULE');
export interface PublicSchedulePort {
  read(): Promise<unknown>;
}

// Public-mode transport. Composition must provide the system-only
// PublicScheduleReader, never the legacy profile repository.
@Controller('api/settings/schedule')
export class PublicScheduleController {
  constructor(
    @Inject(PUBLIC_SCHEDULE) private readonly schedule: PublicSchedulePort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    // Keep the HTTP boundary safe even if a replacement adapter adds columns or
    // throws an exception containing private storage details.
    return readPublicSchedule(() => this.schedule.read());
  }
}
