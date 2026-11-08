import type { RelevancePolicy, SelectedPost } from '@digest/contracts';

import {
  selectXPosts,
  type XSelectionCandidate,
} from '../application/select-x-posts';
import type { PostVerificationPort } from '../domain/posts';
import type { XSearchPort, XSearchRequest } from '../domain/x-search.port';

/** One isolated search and bounded official verification, with no repository,
 * cache or production accounting. Search failures propagate before verification.
 */
export async function developmentXCandidates(
  search: XSearchPort,
  embeds: PostVerificationPort,
  request: XSearchRequest,
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  mode: 'lexical' | 'semantic-candidates' = 'lexical',
): Promise<{
  posts: SelectedPost[];
  verified: number;
  verificationErrors: number;
}> {
  if (!Number.isInteger(budget) || budget <= 0)
    return { posts: [], verified: 0, verificationErrors: 0 };
  const result = await search.search(request);
  if (result.execution === 'unconfirmed')
    throw new Error('Development X search stopped: unconfirmed');
  const rows: XSelectionCandidate[] = [];
  let verificationErrors = 0;
  const seen = new Set<string>();
  // Bound free network work independently of model output size or UI budget.
  for (const link of result.links) {
    if (seen.has(link.externalId)) continue;
    if (seen.size >= 20) break;
    seen.add(link.externalId);
    try {
      const post = await embeds.verify(
        link.externalId,
        link.verificationUrl ?? link.url,
      );
      if (post.externalId !== link.externalId || !post.publishedAt)
        throw new Error('Unusable official X identity or time');
      const publishedAt = new Date(post.publishedAt);
      if (!Number.isFinite(publishedAt.getTime()))
        throw new Error('Invalid official X time');
      rows.push({
        ...post,
        publishedAt,
        reportedEngagement: result.reportedEngagement?.find(
          (observation) => observation.externalId === post.externalId,
        ),
      });
    } catch {
      verificationErrors++;
    }
  }
  return {
    posts: selectXPosts(rows, policy, start, end, budget, mode),
    verified: rows.length,
    verificationErrors,
  };
}
