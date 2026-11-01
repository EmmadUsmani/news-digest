import type { Topic, TopicUpdate } from '@digest/contracts';
export abstract class TopicRepository { abstract createDefault(input: TopicUpdate): Promise<Topic>; abstract reorderDefault(ids: string[]): Promise<boolean>; abstract listDefault(): Promise<Topic[]>; abstract updateDefault(id: string, update: TopicUpdate): Promise<Topic | null>; }
