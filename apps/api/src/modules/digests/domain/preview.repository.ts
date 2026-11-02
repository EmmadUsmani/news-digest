import type { DigestPreview, PreviewHistory } from '@digest/contracts';
export interface EditionProgress {
  stage: 'topics' | 'publishing';
  topics: {
    id: string;
    name: string;
    stage: 'triage' | 'editing' | 'posts' | 'ready';
  }[];
}
export type ReportEditionProgress = (
  progress: EditionProgress,
) => Promise<void>;
export abstract class PreviewRepository {
  abstract generate(
    start: Date,
    end: Date,
    scheduledKey?: string,
    reportProgress?: ReportEditionProgress,
  ): Promise<DigestPreview>;
  abstract history(offset: number): Promise<PreviewHistory>;
  abstract find(id: string): Promise<DigestPreview | null>;
  abstract latest(): Promise<DigestPreview | null>;
}
