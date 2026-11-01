import { BadRequestException, Body, Controller, Get, Module, Post } from '@nestjs/common';
import { previewRequestSchema } from '@digest/contracts';
import { PreviewRepository } from './domain/preview.repository';
import { PostgresPreviewRepository } from './database/preview.repository';
@Controller('api/digest-previews')
class PreviewController {
 constructor(private readonly repository: PreviewRepository) {}
 @Get('latest') latest() { return this.repository.latest(); }
 @Post() generate(@Body() body: unknown) {
 const parsed = previewRequestSchema.safeParse(body);
 if (!parsed.success) throw new BadRequestException('Provide ISO windowStart and windowEnd');
 const start = new Date(parsed.data.windowStart), end = new Date(parsed.data.windowEnd);
 if (start >= end || end.getTime() - start.getTime() > 31 * 86400000 || end.getTime() > Date.now()) throw new BadRequestException('Use a past window of at most 31 days');
 return this.repository.generate(start,end);
 }
}
@Module({ controllers: [PreviewController], providers: [{ provide: PreviewRepository, useClass: PostgresPreviewRepository }] })
export class DigestsModule {}
