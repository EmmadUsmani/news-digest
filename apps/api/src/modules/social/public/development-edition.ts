import type { RelevancePolicy } from '@digest/contracts';

import type { PostVerificationPort } from '../domain/posts';
import type { XSearchRequest } from '../domain/x-search.port';
import { developmentXCandidates } from './development-candidates';
import { developmentSearch } from './development-search';

/** One explicit composition per private test edition. Repeated consumers of the
 * same topic share discovery and verification; conflicting inputs fail closed.
 * Nothing is installed in scheduled generation or written to production caches.
 */
export function developmentEditionX(
  runtime: Parameters<typeof developmentSearch>[0],
  embeds: PostVerificationPort,
  editionId: string,
) {
  const search = developmentSearch(runtime, editionId);
  const topics = new Map<
    string,
    { input: string; result: ReturnType<typeof developmentXCandidates> }
  >();
  return {
    candidates(
      topicId: string,
      request: XSearchRequest,
      policy: RelevancePolicy,
      start: Date,
      end: Date,
      budget: number,
      mode: 'lexical' | 'semantic-candidates' = 'lexical',
    ) {
      if (!topicId.trim()) throw new Error('Missing development topic ID');
      if (
        !Number.isFinite(start.getTime()) ||
        !Number.isFinite(end.getTime()) ||
        start >= end
      )
        throw new Error('Invalid development X window');
      const boundedRequest: XSearchRequest = structuredClone({
        ...request,
        fromDate: start.toISOString().slice(0, 10),
        toDate: end.toISOString().slice(0, 10),
        publicationWindow: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      });
      const input = JSON.stringify([boundedRequest, policy, budget, mode]);
      const prior = topics.get(topicId);
      if (prior) {
        if (prior.input !== input)
          throw new Error('Conflicting development topic discovery');
        return prior.result.then((value) => structuredClone(value));
      }
      const result = developmentXCandidates(
        search,
        embeds,
        boundedRequest,
        structuredClone(policy),
        new Date(start),
        new Date(end),
        budget,
        mode,
      );
      topics.set(topicId, { input, result });
      return result.then((value) => structuredClone(value));
    },
  };
}
