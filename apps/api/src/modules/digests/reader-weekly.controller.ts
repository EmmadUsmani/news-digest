import {
  readerWeeklyEditionSchema,
  readerWeeklyHistorySchema,
} from '@digest/contracts';
import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import type { WeeklyPublication } from './application/generate-weekly-review';
import { WeeklyPublicationReader } from './application/weekly-publication-reader';

export function readerWeeklyEdition(snapshot: WeeklyPublication) {
  return readerWeeklyEditionSchema.parse({
    ...snapshot,
    topics: snapshot.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      stories: topic.review?.stories ?? [],
    })),
  });
}

@Controller('api/weekly-editions')
export class ReaderWeeklyController {
  constructor(private readonly repository: WeeklyPublicationReader) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async history(@Query('offset') offset = '0') {
    if (!/^(0|[1-9]\d{0,6})$/.test(offset))
      throw new BadRequestException(
        'Use a nonnegative offset of at most 9999999',
      );
    const history = await this.repository.history(null, Number(offset));
    return readerWeeklyHistorySchema.parse({
      ...history,
      entries: history.entries.map((entry) => ({
        ...entry,
        topics: entry.topics.map(({ id, name }) => ({ id, name })),
      })),
    });
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async find(@Param('id', new ParseUUIDPipe()) id: string) {
    const snapshot = await this.repository.findById(id, null);
    if (!snapshot) throw new NotFoundException('Week in review not found');
    return readerWeeklyEdition(snapshot);
  }
}
