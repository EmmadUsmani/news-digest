import type { DigestPreview, SelectedSocialPost } from '@digest/contracts';

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

// Callers retain full platform-specific snapshot metadata. Production callers
// still supply X/Reddit only; Bluesky preparation has its own editor.
export type EditorialPost = SelectedSocialPost;
function preferX<T extends EditorialPost>(
  posts: T[],
  qualifyingX: number,
  budget: number,
): T[] {
  const redditLimit = Math.max(
    0,
    budget - Math.min(qualifyingX, Math.ceil(budget * 0.7)),
  );
  let redditCount = 0;
  return posts
    .filter((post) => post.platform === 'x' || ++redditCount <= redditLimit)
    .slice(0, Math.max(0, budget));
}

const editorialId = (post: EditorialPost) =>
  post.platform === 'x' ? post.externalId : `reddit:${post.externalId}`;

// Candidates have already passed verified-storage, scope, window, exclusions
// and conservative text/link deduplication. Incomplete AI coverage preserves the fallback.
export async function editTopicPosts<T extends EditorialPost>(
  services: SocialSelectionServices | null,
  topic: TriageTopic,
  candidates: T[],
  fallback: T[],
  budget: number,
  runId: string,
) {
  const editorial: PostEditorial = {
    mode: 'non-ai',
    model: null,
    triage: [],
    unscoredIds: candidates.map(editorialId),
    reason:
      budget === 0
        ? 'Non-AI selection: post budget is zero.'
        : 'Non-AI selection: social editor unavailable within caps.',
  };
  const result = {
    posts: preferX(
      fallback,
      fallback.filter((p) => p.platform === 'x').length,
      budget,
    ),
    postSelectionMethod: 'verified-lexical-engagement-v3' as
      'verified-lexical-engagement-v3' | 'verified-semantic-engagement-v3',
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
      id: editorialId(p),
      title: p.platform === 'x' ? 'Verified X post' : 'Reddit post',
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
  const engagement = (id: string) => {
    const post = candidates.find((p) => editorialId(p) === id);
    return post?.platform === 'x' ? (post.xSearchRanking?.bonus ?? 0) : 0;
  };
  const shortlist = triage.scores
    .filter((s) => s.relevance >= 6 && s.importance >= 4)
    .sort(
      (a, b) =>
        b.importance + engagement(b.id) - (a.importance + engagement(a.id)) ||
        b.relevance - a.relevance ||
        a.id.localeCompare(b.id),
    )
    .flatMap((s) => {
      const post = candidates.find((p) => editorialId(p) === s.id);
      return post
        ? [
            {
              id: editorialId(post),
              platform: post.platform,
              text: post.text,
              author: post.author,
              publishedAt: post.publishedAt,
              relevance: s.relevance,
              interestingness: s.importance,
            },
          ]
        : [];
    })
    // Keep good X candidates available even when Reddit triage scores higher.
    .sort((a, b) => Number(b.platform === 'x') - Number(a.platform === 'x'))
    .slice(0, 10);
  const edited = await services.socialEditor.edit(
    topic,
    shortlist,
    Math.min(20, budget),
    runId,
  );
  if (!edited) return result;
  // Reserve about 70% of slots for qualifying X candidates. If the editor
  // declines them, leave slots empty rather than substituting Reddit filler.
  const xCount = shortlist.filter((p) => p.platform === 'x').length;
  const chosen = edited.posts.flatMap((p) => {
    const original = candidates.find((c) => editorialId(c) === p.id);
    return original ? [original] : [];
  });
  result.posts = preferX(chosen, xCount, budget).map((original) => {
    const p = edited.posts.find((p) => p.id === editorialId(original))!;
    const score = triage.scores.find((s) => s.id === p.id)!;
    return {
      ...original,
      whyItMatters: p.whyItMatters,
      reasons: [
        original.platform === 'x'
          ? 'Verified X post passes time, text and exclusion checks.'
          : 'Reddit post passes window, topic, safety and historical-strength checks.',
        `Semantic relevance ${score.relevance}/10; interestingness ${score.importance}/10: ${score.rationale}`,
        `Editor: ${p.rationale}`,
        ...(original.platform === 'x' && original.xSearchRanking
          ? [original.xSearchRanking.reason]
          : ['No usable X search engagement ranking evidence.']),
        'Semantic shortlist orders by interestingness plus bounded reported engagement, then relevance; media contents and measured growth were not inferred.',
      ],
    };
  });
  result.postSelectionMethod = 'verified-semantic-engagement-v3';
  editorial.mode = 'ai';
  editorial.model = edited.model;
  editorial.reason =
    'AI selected supplied post text after relevance gates and engagement-weighted shortlisting with X preference; reported counts are unverified and media contents are not inferred.';
  return result;
}
