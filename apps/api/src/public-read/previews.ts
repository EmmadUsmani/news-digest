import { readerEditionHistorySchema } from '@digest/contracts';
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { type PreviewRepository } from '../modules/digests/domain/preview.repository';
import { readerEdition } from '../modules/digests/reader-edition.controller';

type PublishedReads = Pick<PreviewRepository, 'history' | 'latest' | 'find'>;

// Route composition retains separate admin-only cost, job and write handlers.
// Publication filtering is mandatory here, independent of private reader flags.
export class PublicPreviewReads {
  constructor(private readonly repository: PublishedReads) {}

  history(offset = '0') {
    if (!/^(0|[1-9]\d{0,6})$/.test(offset))
      throw new BadRequestException('Invalid offset');
    return this.safe(async () => {
      const history = await this.repository.history(Number(offset), true);
      return readerEditionHistorySchema.parse({
        ...history,
        entries: history.entries.map((entry) => ({
          ...entry,
          topics: (entry.topicModes ?? []).map(({ id, name }) => ({
            id,
            name,
          })),
        })),
      });
    });
  }

  latest() {
    return this.safe(async () => {
      const snapshot = await this.repository.latest(true);
      return snapshot ? readerEdition(snapshot) : null;
    });
  }

  async find(id: string) {
    const result = await this.safe(async () => {
      const snapshot = await this.repository.find(id, true);
      return snapshot ? readerEdition(snapshot) : null;
    });
    if (!result) throw new NotFoundException('Edition not found');
    return result;
  }

  private async safe<T>(read: () => Promise<T>): Promise<T> {
    try {
      return await read();
    } catch {
      throw new ServiceUnavailableException('Editions unavailable');
    }
  }
}
