import type { Topic } from '@digest/contracts';
export abstract class TopicRepository { abstract listDefault(): Promise<Topic[]>; }
