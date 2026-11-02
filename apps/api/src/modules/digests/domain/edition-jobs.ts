import type { EditionProgress } from './preview.repository';
export interface EditionJobStatus {
  id: string;
  state: string;
  editionId: string | null;
  progress: EditionProgress | null;
  durationMs: number | null;
  error: string | null;
}
export abstract class EditionJobs {
  abstract enqueue(start: Date, end: Date): Promise<EditionJobStatus>;
  abstract find(id: string): Promise<EditionJobStatus | null>;
}
