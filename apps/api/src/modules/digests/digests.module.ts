import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { previewRequestSchema } from '@digest/contracts';
import { PreviewRepository } from './domain/preview.repository';
import { PostgresPreviewRepository } from './database/preview.repository';
@Controller('api/digest-previews')
class PreviewController {
  constructor(private readonly repository: PreviewRepository) {}
  @Get() history(@Query('offset') offset = '0') {
    if (!/^(0|[1-9]\d{0,6})$/.test(offset))
      throw new BadRequestException(
        'Use a nonnegative offset of at most 9999999',
      );
    return this.repository.history(Number(offset));
  }
  @Get('latest') latest() {
    return this.repository.latest();
  }
  @Get(':id') async find(@Param('id', new ParseUUIDPipe()) id: string) {
    const snapshot = await this.repository.find(id);
    if (!snapshot) throw new NotFoundException('Edition not found');
    return snapshot;
  }
  @Post() generate(@Body() body: unknown) {
    const parsed = previewRequestSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException('Provide ISO windowStart and windowEnd');
    const start = new Date(parsed.data.windowStart),
      end = new Date(parsed.data.windowEnd);
    if (
      start >= end ||
      end.getTime() - start.getTime() > 31 * 86400000 ||
      end.getTime() > Date.now()
    )
      throw new BadRequestException('Use a past window of at most 31 days');
    return this.repository.generate(start, end);
  }
}
@Module({
  controllers: [PreviewController],
  providers: [
    { provide: PreviewRepository, useClass: PostgresPreviewRepository },
  ],
})
export class DigestsModule {}
