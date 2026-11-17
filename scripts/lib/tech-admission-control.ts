// Offline proposal control only. Runtime admission does not import this module.
export interface AdmissionEvent {
  id: string;
  coverage: readonly { id: string }[];
}
export interface AdmissionScore {
  id: string;
  importance: number;
  relevance: number;
}

export function techAdmissionControl<T extends AdmissionEvent>(input: {
  ranked: readonly T[];
  scores: readonly AdmissionScore[];
  enabled?: boolean;
  topic: string;
  grouping: 'validated' | 'failed' | 'unavailable';
  triage: 'complete' | 'failed' | 'incomplete';
}) {
  const baseline = input.ranked.slice(0, 10);
  const fallback = () => ({
    admitted: baseline,
    reserved: [] as string[],
    displaced: [] as string[],
    reservations: [] as {
      eventId: string;
      memberId: string;
      importance: number;
      relevance: number;
      baselineRank: number | null;
    }[],
  });
  if (
    !input.enabled ||
    input.topic !== 'tech' ||
    input.grouping !== 'validated' ||
    input.triage !== 'complete'
  )
    return fallback();

  const scores = new Map(input.scores.map((score) => [score.id, score]));
  const seen = new Set<string>();
  // Ambiguous membership or missing eligible scores invalidates this control.
  if (
    scores.size !== input.scores.length ||
    new Set(input.ranked.map((event) => event.id)).size !== input.ranked.length
  )
    return fallback();
  const semantic: { event: T; score: AdmissionScore }[] = [];
  const compare = (a: AdmissionScore, b: AdmissionScore) =>
    b.importance - a.importance ||
    b.relevance - a.relevance ||
    a.id.localeCompare(b.id);
  for (const event of input.ranked) {
    if (
      !event.coverage.length ||
      !event.coverage.some((member) => member.id === event.id)
    )
      return fallback();
    const members: AdmissionScore[] = [];
    for (const member of event.coverage) {
      const score = scores.get(member.id);
      if (
        seen.has(member.id) ||
        !score ||
        !Number.isFinite(score.importance) ||
        !Number.isFinite(score.relevance) ||
        score.importance < 4 ||
        score.relevance < 6
      )
        return fallback();
      seen.add(member.id);
      members.push(score);
    }
    members.sort(compare);
    semantic.push({ event, score: members[0] });
  }
  semantic.sort((a, b) => compare(a.score, b.score));
  const reserved = semantic.slice(0, 2).map((item) => item.event.id);
  const selected = new Set(reserved);
  for (const event of input.ranked) {
    if (selected.size >= 10) break;
    selected.add(event.id);
  }
  return {
    admitted: input.ranked.filter((event) => selected.has(event.id)),
    reserved,
    reservations: semantic.slice(0, 2).map(({ event, score }) => ({
      eventId: event.id,
      memberId: score.id,
      importance: score.importance,
      relevance: score.relevance,
      baselineRank: baseline.some((candidate) => candidate.id === event.id)
        ? baseline.findIndex((candidate) => candidate.id === event.id) + 1
        : null,
    })),
    displaced: baseline
      .filter((event) => !selected.has(event.id))
      .map((event) => event.id),
  };
}
