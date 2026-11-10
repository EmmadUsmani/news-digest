import type { LlmRequest } from './llm.port';

export interface RejectedEditorRecord {
  request: LlmRequest;
  responseText: string;
  diagnostic: {
    attempt: string;
    category: string;
    field?: string;
    absenceMarker?: string;
    schemaIssues?: string[];
  };
}
export interface RejectedEditorStore {
  save(record: RejectedEditorRecord): Promise<void>;
}
