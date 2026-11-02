import type { DigestPreview, SelectedPost } from '@digest/contracts';

import type {
  SocialEditorialCandidate,
  SocialEditorialResult,
  TriageResult,
  TriageTopic,
} from '../../curation/public/editorial';

type PostEditorial = NonNullable<
  DigestPreview['topics'][number]['postEditorial']
>;
export interface SocialSelectionServices {
  socialTriage: {
    score(
      topic: TriageTopic,
      candidates: {
        id: string;
        title: string;
        excerpt: string;
        sources: string[];
      }[],
      runId: string,
    ): Promise<TriageResult>;
  };
  socialEditor: {
    edit(
      topic: TriageTopic,
      candidates: SocialEditorialCandidate[],
      budget: number,
      runId: string,
    ): Promise<SocialEditorialResult | null>;
  };
}

// Candidates have already passed verified-storage, scope, window, exclusions
// and conservative text/link deduplication. Incomplete AI coverage preserves the fallback.
export async function editTopicPosts(
  services: SocialSelectionServices | null,
  topic: TriageTopic,
  candidates: SelectedPost[],
  fallback: SelectedPost[],
  budget: number,
  runId: string,
) {
  const editorial: PostEditorial = {
    mode: 'non-ai',
    model: null,
    triage: [],
    unscoredIds: candidates.map((p) => p.externalId),
    reason:
      budget === 0
        ? 'Non-AI selection: post budget is zero.'
        : 'Non-AI selection: social editor unavailable within caps.',
  };
  const result = {
    posts: fallback,
    postSelectionMethod: 'verified-lexical-recency-v2' as
      'verified-lexical-recency-v2' | 'verified-semantic-editor-v2',
    postEditorial: editorial,
  };
  if (budget === 0) return result;
  if (candidates.length === 0) {
    editorial.reason =
      'No verified posts pass source, window, safety and duplicate checks; no social AI calls were needed.';
    return result;
  }
  if (!services) return result;
  const triage = await services.socialTriage.score(
    topic,
    candidates.map((p) => ({
      id: p.externalId,
      title: 'Verified X post',
      excerpt: p.text,
      sources: [],
    })),
    runId,
  );
  editorial.triage = triage.scores;
  editorial.unscoredIds = triage.unscoredIds;
  if (triage.unscoredIds.length) {
    editorial.reason =
      'Non-AI selection: social triage is incomplete; retained lexical fallback.';
    return result;
  }
  const shortlist = triage.scores
    .filter((s) => s.relevance >= 6 && s.importance >= 4)
    .sort(
      (a, b) =>
        b.importance - a.importance ||
        b.relevance - a.relevance ||
        a.id.localeCompare(b.id),
    )
    .flatMap((s) => {
      const post = candidates.find((p) => p.externalId === s.id);
      return post
        ? [
            {
              id: post.externalId,
              text: post.text,
              author: post.author,
              publishedAt: post.publishedAt,
              relevance: s.relevance,
              interestingness: s.importance,
            },
          ]
        : [];
    })
    .slice(0, 10);
  const edited = await services.socialEditor.edit(
    topic,
    shortlist,
    Math.min(20, budget),
    runId,
  );
  if (!edited) return result;
  result.posts = edited.posts.map((p) => {
    const original = candidates.find((c) => c.externalId === p.id)!;
    const score = triage.scores.find((s) => s.id === p.id)!;
    return {
      ...original,
      whyItMatters: p.whyItMatters,
      reasons: [
        'Verified post passes time, text and exclusion checks.',
        `Semantic relevance ${score.relevance}/10; interestingness ${score.importance}/10: ${score.rationale}`,
        `Editor: ${p.rationale}`,
        'Engagement, velocity and media contents were not inferred.',
      ],
    };
  });
  result.postSelectionMethod = 'verified-semantic-editor-v2';
  editorial.mode = 'ai';
  editorial.model = edited.model;
  editorial.reason =
    'AI selected verified post text; engagement and virality are unknown.';
  return result;
}
