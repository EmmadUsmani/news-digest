export interface XExperimentEvidence {
  requestId: string;
  topicId: string;
  model: string;
  style: 'current' | 'trending' | 'reactions';
  window: { start: string; end: string };
  costMicros: number;
  postsFetched: number;
  actualToolCalls: unknown[];
  expectedSearch?: { minFaves: number; exclusions: string[] };
  posts: {
    id: string;
    publishedAt: string | null;
    likes: number | null;
    relevance: number | null;
    promotion: boolean | null;
  }[];
}

// These checks describe saved tool inputs, not whether X honored an operator.
// Only the adapter's actual { name, input } records count as execution evidence.
function searchExecution(call: XExperimentEvidence) {
  const expected = call.expectedSearch;
  if (!expected || call.style === 'current') return null;
  if (
    !Number.isSafeInteger(expected.minFaves) ||
    expected.minFaves < 0 ||
    expected.exclusions.some((value) => !/^-[a-zA-Z0-9_]+$/.test(value))
  )
    throw new Error('Invalid expected experiment search');
  const queries = call.actualToolCalls.map((raw) => {
    let value: unknown;
    const record = raw as { name?: unknown; input?: unknown } | null;
    try {
      value =
        typeof record?.input === 'string' ? JSON.parse(record.input) : null;
    } catch {
      value = null;
    }
    const args = value as { query?: unknown; mode?: unknown } | null;
    if (
      record?.name !== 'x_keyword_search' ||
      typeof args?.query !== 'string' ||
      typeof args.mode !== 'string'
    )
      return { observed: false as const };
    // Remove quoted text before checking operators: a quoted "OR" or
    // "min_faves:100" is a search term, not evidence of an operator.
    const unquoted = args.query.replace(/"(?:\\.|[^"\\])*"/g, ' ');
    if (unquoted.includes('"')) return { observed: false as const };
    const tokens = unquoted.split(/\s+/).filter(Boolean);
    const thresholds = tokens.filter((token) => token.startsWith('min_faves:'));
    return {
      observed: true as const,
      query: args.query,
      mode: args.mode,
      top: args.mode === 'Top',
      threshold:
        thresholds.length === 1 &&
        thresholds[0] === `min_faves:${expected.minFaves}`,
      filters:
        ['-filter:replies', '-filter:retweets', 'lang:en'].every((token) =>
          tokens.includes(token),
        ) &&
        !tokens.includes('filter:replies') &&
        !tokens.includes('filter:retweets') &&
        tokens.filter((token) => token.startsWith('lang:')).length === 1,
      exclusions: expected.exclusions.every((token) => tokens.includes(token)),
      storyOr: call.style === 'reactions' ? tokens.includes('OR') : null,
    };
  });
  const observed = queries.filter((query) => query.observed);
  return {
    expected,
    queries,
    inputsMatch:
      !queries.length || observed.length !== queries.length
        ? null
        : observed.every(
            (query) =>
              query.top &&
              query.threshold &&
              query.filters &&
              query.exclusions &&
              query.storyOr !== false,
          ),
    // A low reported count contradicts the threshold; passing counts alone
    // cannot establish that the operator works. Unknown counts stay explicit.
    returnedBelowThreshold: call.posts.filter(
      (post) => post.likes !== null && post.likes < expected.minFaves,
    ).length,
    returnedWithUnknownLikes: call.posts.filter((post) => post.likes === null)
      .length,
  };
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
      searchExecution: searchExecution(call),
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
