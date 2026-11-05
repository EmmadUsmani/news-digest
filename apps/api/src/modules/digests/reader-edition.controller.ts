import {
  type DigestPreview,
  readerEditionHistorySchema,
  readerEditionSchema,
} from '@digest/contracts';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { PreviewRepository } from './domain/preview.repository';

export function readerEdition(snapshot: DigestPreview) {
  return readerEditionSchema.parse({
    ...snapshot,
    topics: snapshot.topics.map((topic) => ({
      ...topic,
      brief: topic.editorial?.mode === 'ai' ? topic.editorial.brief : [],
      stories: topic.stories.map((story) => ({
        ...story,
        summary: story.summary || story.excerpt,
      })),
      posts: topic.posts ?? [],
    })),
  });
}

@Controller('api/editions')
export class ReaderEditionController {
  constructor(private readonly repository: PreviewRepository) {}

  @Get() async history(@Query('offset') offset = '0') {
    if (!/^(0|[1-9]\d{0,6})$/.test(offset))
      throw new BadRequestException(
        'Use a nonnegative offset of at most 9999999',
      );
    return readerEditionHistorySchema.parse(
      await this.repository.history(Number(offset)),
    );
  }

  @Get('latest') async latest() {
    const snapshot = await this.repository.latest();
    return snapshot ? readerEdition(snapshot) : null;
  }

  @Get(':id') async find(@Param('id', new ParseUUIDPipe()) id: string) {
    const snapshot = await this.repository.find(id);
    if (!snapshot) throw new NotFoundException('Edition not found');
    return readerEdition(snapshot);
  }
}
