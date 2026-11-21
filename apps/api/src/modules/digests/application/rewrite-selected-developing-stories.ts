import {
  developingRewriteRequest,
  type EditorialCandidate,
  type LlmExecutionContext,
  type LlmPort,
  type ModelPrice,
  validateDevelopingRewrite,
} from '../../curation/public/developing-rewrite';
import type { developingLinks } from '../domain/developing-links';
import { rewriteDevelopingStories } from './rewrite-developing-stories';

// Fixed-selection rewrite using the caller’s budgeted port.
export function rewriteSelectedDevelopingStories<
  S extends {
    id: string;
    title: string;
    summary: string;
    whyItMatters: string;
  },
>(input: {
  selected: readonly S[];
  evidence: readonly EditorialCandidate[];
  links: ReturnType<typeof developingLinks>;
  llm: {
    complete(
      ...args: Parameters<LlmPort['complete']>
    ): Promise<{ text: string }>;
  };
  model: ModelPrice;
  runId: string;
  topicId: string;
  topicName: string;
  execution?: LlmExecutionContext;
}) {
  return rewriteDevelopingStories({
    selected: input.selected,
    evidence: input.evidence,
    links: input.links,
    async rewrite(stories) {
      const request = developingRewriteRequest({ ...input, stories });
      const response = await input.llm.complete(request, input.execution);
      return JSON.parse(response.text) as unknown;
    },
    validate: (prose, evidence) =>
      validateDevelopingRewrite(prose, evidence, input.topicName),
  });
}
