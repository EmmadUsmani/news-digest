import { Controller, Get, Module } from '@nestjs/common';

import { PostgresContentRepository } from './database/content.repository';
import { ContentRepository } from './domain/ports';
@Controller('api/content')
class ContentController {
  constructor(private readonly repository: ContentRepository) {}
  @Get() latest() {
    return this.repository.latest();
  }
  @Get('sources') status() {
    return this.repository.status();
  }
}
@Module({
  controllers: [ContentController],
  providers: [
    { provide: ContentRepository, useClass: PostgresContentRepository },
  ],
})
export class IngestionModule {}
