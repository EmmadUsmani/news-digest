import { type DigestPreview, readerEditionSchema } from '@digest/contracts';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { PreviewRepository } from './domain/preview.repository';

export function readerEdition(snapshot: DigestPreview) {
  return readerEditionSchema.parse({
    ...snapshot,
    topics: snapshot.topics.map((topic) => ({
      ...topic,
      brief: topic.editorial?.mode === 'ai' ? topic.editorial.brief : [],
      posts: topic.posts ?? [],
    })),
  });
}

@Controller('api/editions')
export class ReaderEditionController {
  constructor(private readonly repository: PreviewRepository) {}

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
