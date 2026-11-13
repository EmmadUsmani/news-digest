import type { Candidate, rank } from './rank';

// Project only explicit cluster members; do not infer membership from labels.
// Preserve the ranked representative text; only explicit members add reporting.
export function clusterEvidence(
  story: ReturnType<typeof rank>[number],
  candidates: Candidate[],
) {
  const byId = new Map(candidates.map((item) => [item.id, item]));
  const original = byId.get(story.id);
  if (!original) throw new Error('Missing cluster representative');
  const lead = { ...original, title: story.title, excerpt: story.excerpt };
  const seen = new Set([lead.id]);
  const members = story.coverage.flatMap(({ id }) => {
    const member = byId.get(id);
    if (!member || seen.has(id) || !member.excerpt.trim()) return [];
    seen.add(id);
    return [member];
  });
  // Aggregator excerpts can contain headline lists from several publishers.
  // Prefer direct reporting inside the existing cluster, retaining rank order
  // within each tier and using aggregator snippets when no direct text exists.
  const isAggregator = (item: Candidate) => {
    try {
      return new URL(item.url).hostname === 'news.google.com';
    } catch {
      return false;
    }
  };
  members.sort((a, b) => Number(isAggregator(a)) - Number(isAggregator(b)));
  return [lead, ...members.slice(0, 2)].map((item) => ({
    id: item.id,
    title: item.title.slice(0, 300),
    url: item.url,
    excerpt: item.excerpt.slice(0, 600).replace(/[\uD800-\uDBFF]$/, ''),
    ...(item.publisher ? { publisher: item.publisher } : {}),
    sources: [...item.sources],
    publishedAt: item.publishedAt,
  }));
}
