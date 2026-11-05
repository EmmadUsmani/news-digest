import {
  BadRequestException,
  Controller,
  Get,
  Module,
  Query,
} from '@nestjs/common';
import { z } from 'zod';

import { PostgresContentRepository } from './database/content.repository';
import { ContentRepository } from './domain/ports';
@Controller('api/admin/content')
class ContentController {
  constructor(private readonly repository: ContentRepository) {}
  @Get() latest() {
    return this.repository.latest();
  }
  @Get('window') window(@Query() query: unknown) {
    const parsed = z
      .object({
        topicId: z.string().uuid(),
        start: z.string().datetime({ offset: true }),
        end: z.string().datetime({ offset: true }),
      })
      .safeParse(query);
    if (
      !parsed.success ||
      Date.parse(parsed.data.start) >= Date.parse(parsed.data.end)
    )
      throw new BadRequestException(
        'A topic and increasing coverage window are required',
      );
    return this.repository.latest({
      topicId: parsed.data.topicId,
      start: new Date(parsed.data.start),
      end: new Date(parsed.data.end),
    });
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
