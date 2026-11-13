import { clusterEvidence } from '../domain/cluster-evidence';
import type { Candidate, rank } from '../domain/rank';

// Editor input and immutable evidence use the same bounded source text.
export function editorEvidence(
  ranked: ReturnType<typeof rank>,
  pool: Candidate[],
  includeMembers = true,
) {
  if (!includeMembers) {
    return {
      candidates: ranked,
      cited(ids: string[]) {
        return ids.map((id) => {
          const source = ranked.find((story) => story.id === id);
          if (!source) throw new Error('Unknown editorial evidence');
          return {
            id: source.id,
            title: source.title,
            url: source.url,
            excerpt: source.excerpt,
            ...(source.publisher ? { publisher: source.publisher } : {}),
            sources: source.sources,
            publishedAt: source.publishedAt,
          };
        });
      },
    };
  }
  const evidence = new Map(
    ranked.flatMap((story) =>
      clusterEvidence(story, pool).map(
        (member) => [member.id, member] as const,
      ),
    ),
  );
  return {
    candidates: ranked.map((story) => ({
      ...story,
      clusterEvidence: clusterEvidence(story, pool).map((member) => ({
        ...member,
        publisher: member.publisher?.name,
      })),
    })),
    cited(ids: string[]) {
      return ids.map((id) => {
        const member = evidence.get(id);
        if (!member) throw new Error('Unknown editorial evidence');
        return member;
      });
    },
  };
}
