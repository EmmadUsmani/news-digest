import { planJointEventBudget } from '../domain/joint-event-budget';

export interface EventBudgetEvidence {
  id: string;
  text: string;
}

// Event/fact identities are supplied by an editorial review. Exact excerpts
// bind that review to this shortlist; they do not prove semantic equivalence.
export interface EventBudgetAnnotation {
  id: string;
  event: string;
  eventEvidence: string;
  materialFacts: { id: string; evidence: string }[];
}

// Call only with already-qualified candidates. Returned objects retain their
// source metadata and editorial rationale; this function cannot qualify posts.
// Not connected to scheduled selection until saved-edition acceptance passes.
export function selectWithEventBudget<T extends EventBudgetEvidence>(input: {
  stories: readonly EventBudgetEvidence[];
  candidates: readonly T[];
  selectedPostIds: readonly string[];
  postBudget: number;
  annotations: readonly EventBudgetAnnotation[];
}): { status: 'complete' | 'invalid-annotations'; posts: T[] } {
  const { stories, candidates, selectedPostIds, postBudget, annotations } =
    input;
  const original = selectedPostIds.map((id) => {
    const matches = candidates.filter((post) => post.id === id);
    if (matches.length !== 1)
      throw new Error(
        'Expected unique selected IDs in the qualified shortlist',
      );
    return matches[0];
  });
  // Validate caller-owned selection separately: annotation failure must never
  // conceal an invalid baseline or return an over-budget selection.
  planJointEventBudget({
    stories: stories.map(({ id }) => ({ id, event: id, materialFacts: [] })),
    candidates: candidates.map(({ id }) => ({
      id,
      event: id,
      materialFacts: [],
    })),
    selectedPostIds,
    postBudget,
  });
  const evidence = [...stories, ...candidates];
  const byId = new Map(
    annotations.map((annotation) => [annotation.id, annotation]),
  );
  if (
    annotations.length !== evidence.length ||
    byId.size !== annotations.length ||
    evidence.some((slot) => {
      const annotation = byId.get(slot.id);
      return (
        !annotation ||
        !annotation.event.trim() ||
        !annotation.eventEvidence.trim() ||
        !slot.text.includes(annotation.eventEvidence) ||
        new Set(annotation.materialFacts.map((fact) => fact.id)).size !==
          annotation.materialFacts.length ||
        annotation.materialFacts.some(
          (fact) =>
            !fact.id.trim() ||
            !fact.evidence.trim() ||
            !slot.text.includes(fact.evidence),
        )
      );
    })
  )
    return { status: 'invalid-annotations', posts: original };
  const annotate = (slot: EventBudgetEvidence) => {
    const annotation = byId.get(slot.id)!;
    return {
      id: slot.id,
      event: annotation.event,
      materialFacts: annotation.materialFacts.map((fact) => fact.id),
    };
  };
  const ids = planJointEventBudget({
    stories: stories.map(annotate),
    candidates: candidates.map(annotate),
    selectedPostIds,
    postBudget,
  });
  return {
    status: 'complete',
    posts: ids.map((id) => candidates.find((post) => post.id === id)!),
  };
}
