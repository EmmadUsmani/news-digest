import { editionJobIdSchema, previewRequestSchema } from '@digest/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  type DynamicModule,
  Get,
  HttpCode,
  Module,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { PublicPreviewReads } from '../../public-read/previews';
import {
  PUBLIC_PREVIEWS,
  PublicPreviewsController,
} from '../../public-read/previews.controller';
import { publicPreviewsEnabled } from '../../public-read/previews.module';
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
@Controller('api/admin/digest-previews')
export class PreviewOperationsController {
  constructor(
    protected readonly repository: PreviewRepository,
    private readonly jobs: EditionJobs,
  ) {}
  @Get('jobs/:id') async job(@Param('id') id: string) {
    if (!editionJobIdSchema.safeParse(id).success)
      throw new NotFoundException('Job not found');
    const job = await this.jobs.find(id);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }
  @Post('tests')
  generateTest(@Body() body: unknown) {
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) =>
          !['windowStart', 'windowEnd', 'aiEditing', 'paidXSearch'].includes(
            key,
          ),
      ) ||
      ('aiEditing' in body && typeof body.aiEditing !== 'boolean') ||
      ('paidXSearch' in body && typeof body.paidXSearch !== 'boolean')
    )
      throw new BadRequestException(
        'Provide boolean AI editing and paid X search options',
      );
    const { start, end } = this.window({
      windowStart: 'windowStart' in body ? body.windowStart : undefined,
      windowEnd: 'windowEnd' in body ? body.windowEnd : undefined,
    });
    return this.repository.generateTest(
      start,
      end,
      'aiEditing' in body && body.aiEditing === true,
      'paidXSearch' in body && body.paidXSearch === true,
    );
  }
  @Post('jobs')
  @HttpCode(202)
  enqueue(@Body() body: unknown) {
    const { start, end } = this.window(body);
    return this.jobs.enqueue(start, end);
  }
  @Get(':id/cost') async cost(@Param('id', new ParseUUIDPipe()) id: string) {
    if (!(await this.repository.find(id)))
      throw new NotFoundException('Edition not found');
    return this.repository.cost(id);
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
@Controller('api/admin/digest-previews')
export class PreviewController extends PreviewOperationsController {
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
}
@Module({
  controllers: [ReaderEditionController],
  providers: [
    { provide: EditionJobFailures, useClass: PostgresEditionJobFailures },
    { provide: EditionJobRequests, useClass: PostgresEditionJobRequests },
    { provide: DigestNotifications, useClass: LogDigestNotifications },
    { provide: EditionJobs, useClass: BullEditionJobs },
    { provide: PreviewRepository, useClass: PostgresPreviewRepository },
  ],
})
export class DigestsModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
  ): DynamicModule {
    // Validate before Nest constructs repositories; use the same transport gate.
    if (!publicPreviewsEnabled(env))
      return { module: DigestsModule, controllers: [PreviewController] };
    return {
      module: DigestsModule,
      controllers: [PreviewOperationsController, PublicPreviewsController],
      providers: [
        {
          provide: PUBLIC_PREVIEWS,
          inject: [PreviewRepository],
          useFactory: (repository: PreviewRepository) =>
            new PublicPreviewReads(repository),
        },
      ],
    };
  }
}
