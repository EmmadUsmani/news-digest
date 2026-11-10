import { Controller, Get, Header, Inject } from '@nestjs/common';

import { readPublicTopics } from './settings';

export const PUBLIC_TOPICS = Symbol('PUBLIC_TOPICS');
export interface PublicTopicsPort {
  read(): Promise<unknown>;
}

// Public-mode composition supplies the system-only PublicTopicsReader.
@Controller('api/admin/topics')
export class PublicTopicsController {
  constructor(
    @Inject(PUBLIC_TOPICS) private readonly topics: PublicTopicsPort,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  read() {
    // Keep the HTTP boundary safe even if a replacement adapter adds columns or
    // throws an exception containing private storage details.
    return readPublicTopics(() => this.topics.read());
  }
}
