import type { WeeklyPublication } from './generate-weekly-review';

export abstract class WeeklyPublicationReader {
  abstract findById(
    id: string,
    profileId: string | null,
  ): Promise<WeeklyPublication | null>;
  abstract history(
    profileId: string | null,
    offset?: number,
    limit?: number,
  ): Promise<{
    entries: WeeklyPublication[];
    nextOffset: number | null;
  }>;
}
