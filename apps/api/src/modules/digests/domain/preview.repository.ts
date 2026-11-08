import type {
  DigestPreview,
  EditionCost,
  PreviewHistory,
} from '@digest/contracts';
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
  abstract generateTest(
    start: Date,
    end: Date,
    aiEditing?: boolean,
  ): Promise<DigestPreview>;
  abstract findByGenerationKey(key: string): Promise<{ id: string } | null>;
  abstract history(
    offset: number,
    publishedOnly?: boolean,
  ): Promise<PreviewHistory>;
  abstract find(
    id: string,
    publishedOnly?: boolean,
  ): Promise<DigestPreview | null>;
  abstract cost(id: string): Promise<EditionCost>;
  abstract latest(publishedOnly?: boolean): Promise<DigestPreview | null>;
}
