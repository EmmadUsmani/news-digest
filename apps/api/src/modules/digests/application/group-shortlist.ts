import type { Candidate } from '../domain/rank';

interface GroupingPort {
  group(
    topicId: string,
    candidates: {
      id: string;
      topicId: string;
      title: string;
      outlet: string;
      publishedAt: string;
      excerpt: string;
    }[],
    runId: string,
  ): Promise<string[][]>;
}

// Only an already admitted editorial shortlist is sent to the optional AI pass.
// Membership is explicit: there are no title rules or transitive joins.
export async function groupShortlist(
  grouping: GroupingPort | null,
  topicId: string,
  shortlist: Candidate[],
  runId: string,
): Promise<(a: Candidate, b: Candidate) => boolean> {
  const separate = () => false;
  if (!grouping || shortlist.length < 2 || shortlist.length > 10)
    return separate;
  try {
    const groups = await grouping.group(
      topicId,
      shortlist.map((item) => ({
        id: item.id,
        topicId,
        title: item.title,
        outlet: item.sources.join(', '),
        publishedAt: item.publishedAt,
        excerpt: item.excerpt,
      })),
      runId,
    );
    const ids = new Set(shortlist.map((item) => item.id));
    const memberships = new Map<string, number>();
    for (const [index, group] of groups.entries()) {
      if (group.length < 2) return separate;
      for (const id of group) {
        if (!ids.has(id) || memberships.has(id)) return separate;
        memberships.set(id, index);
      }
    }
    return (a, b) =>
      a.id !== b.id &&
      memberships.has(a.id) &&
      memberships.get(a.id) === memberships.get(b.id);
  } catch {
    return separate;
  }
}
