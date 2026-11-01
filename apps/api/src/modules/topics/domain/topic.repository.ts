import type {
  CustomFeed,
  SourceCatalog,
  Topic,
  TopicUpdate,
} from '@digest/contracts';
export abstract class TopicRepository {
  abstract addFeedDefault(
    id: string,
    input: CustomFeed,
  ): Promise<Topic | null | false>;
  abstract deleteDefault(id: string): Promise<Topic[] | null>;
  abstract catalog(): Promise<SourceCatalog>;
  abstract connectDefault(
    id: string,
    ids: string[],
  ): Promise<Topic | null | false>;
  abstract createDefault(input: TopicUpdate): Promise<Topic>;
  abstract reorderDefault(ids: string[]): Promise<boolean>;
  abstract listDefault(): Promise<Topic[]>;
  abstract updateDefault(
    id: string,
    update: TopicUpdate,
  ): Promise<Topic | null>;
}
