export interface XExperimentEvidence {
  requestId: string;
  topicId: string;
  model: string;
  style: 'current' | 'trending' | 'reactions';
  window: { start: string; end: string };
  costMicros: number;
  postsFetched: number;
  actualToolCalls: unknown[];
  posts: {
    id: string;
    publishedAt: string | null;
    likes: number | null;
    relevance: number | null;
    promotion: boolean | null;
  }[];
}

function integer(value: number) {
  return Number.isSafeInteger(value) && value >= 0;
}
function timestamp(value: string) {
  return value.trim() !== '' && Number.isFinite(Date.parse(value));
}

// Offline only. Labels must come from saved triage/review evidence; this helper
// neither calls a model nor interprets missing evidence as a negative label.
export function xExperimentReport(calls: XExperimentEvidence[]) {
  const requests = new Set<string>();
  return calls.map((call) => {
    const start = Date.parse(call.window.start);
    const end = Date.parse(call.window.end);
    if (
      !call.requestId.trim() ||
      requests.has(call.requestId) ||
      !call.topicId.trim() ||
      !call.model.trim() ||
      !['current', 'trending', 'reactions'].includes(call.style) ||
      !timestamp(call.window.start) ||
      !timestamp(call.window.end) ||
      start >= end ||
      !integer(call.costMicros) ||
      !integer(call.postsFetched) ||
      !Array.isArray(call.actualToolCalls)
    )
      throw new Error('Invalid experiment call evidence');
    requests.add(call.requestId);
    const ids = new Set<string>();
    for (const post of call.posts) {
      if (
        !/^\d+$/.test(post.id) ||
        ids.has(post.id) ||
        (post.publishedAt !== null && !timestamp(post.publishedAt)) ||
        (post.likes !== null && !integer(post.likes)) ||
        (post.relevance !== null &&
          (!Number.isFinite(post.relevance) ||
            post.relevance < 0 ||
            post.relevance > 10)) ||
        (post.promotion !== null && typeof post.promotion !== 'boolean')
      )
        throw new Error('Invalid experiment post evidence');
      ids.add(post.id);
    }
    const likes = call.posts
      .flatMap((post) => (post.likes === null ? [] : [post.likes]))
      .sort((a, b) => a - b);
    const n = call.posts.length;
    const inside = (post: XExperimentEvidence['posts'][number]) =>
      post.publishedAt !== null &&
      Date.parse(post.publishedAt) >= start &&
      Date.parse(post.publishedAt) < end;
    const inWindow = call.posts.filter(inside).length;
    const triagePassing = call.posts.filter(
      (post) => post.relevance !== null && post.relevance >= 6,
    ).length;
    const promotions = call.posts.filter(
      (post) => post.promotion === true,
    ).length;
    const unknown = {
      publishedAt: call.posts.filter((post) => post.publishedAt === null)
        .length,
      likes: n - likes.length,
      relevance: call.posts.filter((post) => post.relevance === null).length,
      promotion: call.posts.filter((post) => post.promotion === null).length,
    };
    const eligible = call.posts.filter(
      (post) =>
        inside(post) &&
        post.relevance !== null &&
        post.relevance >= 6 &&
        post.promotion === false,
    ).length;
    const complete =
      unknown.publishedAt + unknown.relevance + unknown.promotion === 0;
    return {
      requestId: call.requestId,
      topicId: call.topicId,
      model: call.model,
      style: call.style,
      window: call.window,
      costMicros: call.costMicros,
      postsFetched: call.postsFetched,
      returnedPosts: n,
      actualToolCalls: call.actualToolCalls,
      reportedLikes: {
        observed: likes.length,
        median: likes.length
          ? (likes[Math.floor((likes.length - 1) / 2)] +
              likes[Math.floor(likes.length / 2)]) /
            2
          : null,
        maximum: likes.length ? likes[likes.length - 1] : null,
      },
      inWindow,
      inWindowShare: n && !unknown.publishedAt ? inWindow / n : null,
      triagePassing,
      triagePassingShare: n && !unknown.relevance ? triagePassing / n : null,
      promotions,
      unknown,
      eligiblePosts: complete ? eligible : null,
      eligiblePostsPerDollar:
        complete && call.costMicros > 0
          ? (eligible * 1_000_000) / call.costMicros
          : null,
      zeroPromotions: unknown.promotion ? null : promotions === 0,
    };
  });
}
