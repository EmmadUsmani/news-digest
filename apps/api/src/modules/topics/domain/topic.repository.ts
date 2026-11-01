import type { Topic, TopicUpdate } from '@digest/contracts';
export abstract class TopicRepository { abstract listDefault(): Promise<Topic[]>; abstract updateDefault(id: string, update: TopicUpdate): Promise<Topic | null>; }
