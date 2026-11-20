import type { DevelopingRequestCaptures } from '../../apps/api/src/modules/curation/application/developing-captured-requests';
import type {
  LlmPort,
  LlmRequest,
} from '../../apps/api/src/modules/curation/domain/llm.port';

// Offline only: the sole response source is supplied text, never a provider.
// Capture attempted requests even when the coordinator subsequently refuses.
// Missing stages remain missing; this does not invent no-op rewrite requests.
export async function captureDevelopingExecution<T>(input: {
  editionId: string;
  topicIds: readonly string[];
  responses: readonly string[];
  execute: (port: LlmPort) => Promise<T>;
}) {
  const requests: LlmRequest[] = [];
  let responseIndex = 0;
  const value = await input.execute({
    complete(request) {
      requests.push({ ...request, model: { ...request.model } });
      if (responseIndex >= input.responses.length)
        return Promise.reject(new Error('Offline response unavailable'));
      return Promise.resolve({
        text: input.responses[responseIndex++],
        usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
      });
    },
  });
  const stage = (purpose: string) =>
    requests
      .filter((request) => request.purpose === purpose)
      .map((request) => ({
        editionId: request.runId,
        topicId: request.topicId ?? '',
        status: 'request-ready',
        request,
      }));
  const captures: DevelopingRequestCaptures = {
    editionId: input.editionId,
    topicIds: [...input.topicIds],
    matching: stage('story-grouping-v3'),
    rewrites: stage('developing-rewrite'),
    additionalRequests: requests.filter(
      (request) =>
        !['story-grouping-v3', 'developing-rewrite'].includes(request.purpose),
    ),
  };
  return { value, captures, responsesConsumed: responseIndex };
}
