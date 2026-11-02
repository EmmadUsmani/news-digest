import { z } from 'zod';

import { llmFingerprint } from '../application/llm-fingerprint';
import {
  type LlmPort,
  type LlmRequest,
  type LlmResponse,
} from '../domain/llm.port';

const recordSchema = z.object({
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  model: z.string().min(1),
  response: z.object({
    text: z.string(),
    usage: z.object({
      input: z.number().int().nonnegative(),
      cacheWrite: z.number().int().nonnegative(),
      cacheRead: z.number().int().nonnegative(),
      output: z.number().int().nonnegative(),
    }),
  }),
});
export const llmRecordingSchema = z.object({
  version: z.literal(1),
  provenance: z.string().min(1),
  records: z.array(recordSchema),
});
export type LlmRecording = z.infer<typeof llmRecordingSchema>;

// No provider dependency or fallback: a changed prompt/model must fail offline.
export class ReplayLlmAdapter implements LlmPort {
  private readonly records: LlmRecording['records'];
  private readonly cursors = new Map<string, number>();
  constructor(recording: unknown) {
    this.records = llmRecordingSchema.parse(recording).records;
  }
  complete(request: LlmRequest): Promise<LlmResponse> {
    const fingerprint = llmFingerprint(request);
    const matches = this.records.filter(
      (record) => record.fingerprint === fingerprint,
    );
    const index = this.cursors.get(fingerprint) ?? 0;
    const record = matches[index];
    if (!record || record.model !== request.model.id)
      return Promise.reject(
        new Error(
          `Missing LLM replay response: ${fingerprint} (#${index + 1})`,
        ),
      );
    this.cursors.set(fingerprint, index + 1);
    return Promise.resolve(structuredClone(record.response));
  }
}

// Recording is opt-in at the caller; this wrapper never stores keys, headers,
// request prompts or provider errors. Save only to a new, reviewed fixture file.
export class RecordingLlmAdapter implements LlmPort {
  private readonly records: LlmRecording['records'] = [];
  constructor(private readonly provider: LlmPort) {}
  async complete(request: LlmRequest): Promise<LlmResponse> {
    const fingerprint = llmFingerprint(request);
    const response = await this.provider.complete(request);
    this.records.push(
      recordSchema.parse({ fingerprint, model: request.model.id, response }),
    );
    return response;
  }
  snapshot(provenance: string): LlmRecording {
    return structuredClone(
      llmRecordingSchema.parse({
        version: 1,
        provenance,
        records: this.records,
      }),
    );
  }
}
