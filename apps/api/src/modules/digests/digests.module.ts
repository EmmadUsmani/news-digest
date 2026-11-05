import { editionJobIdSchema, previewRequestSchema } from '@digest/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Module,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { LogDigestNotifications } from './adapters/digest-notifications';
import { BullEditionJobs } from './adapters/edition-jobs';
import { PostgresEditionJobFailures } from './database/edition-job-failures';
import { PostgresEditionJobRequests } from './database/edition-job-requests';
import { PostgresPreviewRepository } from './database/preview.repository';
import { DigestNotifications } from './domain/digest-published';
import { EditionJobFailures } from './domain/edition-job-failures';
import { EditionJobRequests } from './domain/edition-job-requests';
import { EditionJobs } from './domain/edition-jobs';
import { PreviewRepository } from './domain/preview.repository';
import { ReaderEditionController } from './reader-edition.controller';
@Controller(['api/digest-previews', 'api/admin/digest-previews'])
export class PreviewController {
  constructor(
    private readonly repository: PreviewRepository,
    private readonly jobs: EditionJobs,
  ) {}
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
  @Get('jobs/:id') async job(@Param('id') id: string) {
    if (!editionJobIdSchema.safeParse(id).success)
      throw new NotFoundException('Job not found');
    const job = await this.jobs.find(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
  @Post('jobs')
  @HttpCode(202)
  enqueue(@Body() body: unknown) {
    const { start, end } = this.window(body);
    return this.jobs.enqueue(start, end);
  }
  @Get(':id') async find(@Param('id', new ParseUUIDPipe()) id: string) {
    const snapshot = await this.repository.find(id);
    if (!snapshot) throw new NotFoundException('Edition not found');
    return snapshot;
  }
  @Post() generate(@Body() body: unknown) {
    const { start, end } = this.window(body);
    return this.repository.generate(start, end);
  }
  private window(body: unknown) {
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
    return { start, end };
  }
}
@Module({
  controllers: [PreviewController, ReaderEditionController],
  providers: [
    { provide: EditionJobFailures, useClass: PostgresEditionJobFailures },
    { provide: EditionJobRequests, useClass: PostgresEditionJobRequests },
    { provide: DigestNotifications, useClass: LogDigestNotifications },
    { provide: EditionJobs, useClass: BullEditionJobs },
    { provide: PreviewRepository, useClass: PostgresPreviewRepository },
  ],
})
export class DigestsModule {}
