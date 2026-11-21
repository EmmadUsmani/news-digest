// Semantic annotations must come from reviewed evidence, never word matching.
// This planner does not decide whether a candidate is relevant or exceptional.
export interface EventBudgetSlot {
  id: string;
  event: string;
  materialFacts: readonly string[];
}

export function planJointEventBudget(input: {
  stories: readonly EventBudgetSlot[];
  candidates: readonly EventBudgetSlot[];
  selectedPostIds: readonly string[];
  postBudget: number;
  postQuota?: { candidateIds: readonly string[]; limit: number };
}): string[] {
  const { stories, candidates, selectedPostIds, postBudget } = input;
  const all = [...stories, ...candidates];
  const quota = input.postQuota;
  if (
    (quota !== undefined &&
      (!Number.isInteger(quota.limit) ||
        quota.limit < 0 ||
        quota.limit > postBudget ||
        new Set(quota.candidateIds).size !== quota.candidateIds.length ||
        quota.candidateIds.some(
          (id) => !candidates.some((slot) => slot.id === id),
        ))) ||
    stories.length > 10 ||
    candidates.length > 10 ||
    !Number.isInteger(postBudget) ||
    postBudget < 0 ||
    postBudget > 20 ||
    selectedPostIds.length > postBudget ||
    new Set(selectedPostIds).size !== selectedPostIds.length ||
    new Set(all.map((slot) => slot.id)).size !== all.length ||
    all.some(
      (slot) =>
        !slot.id.trim() ||
        !slot.event.trim() ||
        slot.materialFacts.some((fact) => !fact.trim()),
    ) ||
    selectedPostIds.some((id) => !candidates.some((slot) => slot.id === id))
  )
    throw new Error('Expected a bounded, fully annotated qualified shortlist');

  const originalIds = new Set(selectedPostIds);
  const original = candidates.filter((slot) => originalIds.has(slot.id));
  const required = [...stories, ...original];
  const requiredEvents = new Set(required.map((slot) => slot.event));
  // Fact identities are scoped to an event: the same short label in another
  // event cannot substitute for the original reporting.
  const facts = (slots: readonly EventBudgetSlot[]) =>
    new Set(
      slots.flatMap((slot) =>
        slot.materialFacts.map((fact) => JSON.stringify([slot.event, fact])),
      ),
    );
  const requiredFacts = facts(required);
  const measure = (posts: readonly EventBudgetSlot[]) => {
    const slots = [...stories, ...posts];
    const counts = new Map<string, number>();
    for (const slot of slots)
      counts.set(slot.event, (counts.get(slot.event) ?? 0) + 1);
    return {
      largest: Math.max(0, ...counts.values()),
      denominator: Math.max(1, slots.length),
      events: counts.size,
      retained: posts.filter((slot) => originalIds.has(slot.id)).length,
    };
  };
  let best = original;
  let bestMetric = measure(best);
  const baseline = bestMetric;
  for (let mask = 0; mask < 2 ** candidates.length; mask++) {
    const posts = candidates.filter((_, index) => mask & (1 << index));
    if (posts.length > postBudget) continue;
    if (
      quota &&
      posts.filter((post) => quota.candidateIds.includes(post.id)).length >
        quota.limit
    )
      continue;
    const slots = [...stories, ...posts];
    const events = new Set(slots.map((slot) => slot.event));
    if ([...requiredEvents].some((event) => !events.has(event))) continue;
    const suppliedFacts = facts(slots);
    if ([...requiredFacts].some((fact) => !suppliedFacts.has(fact))) continue;
    const metric = measure(posts);
    // Only a strict improvement over the original edition may change picks.
    // Compare integer fractions rather than rounded display percentages.
    if (
      metric.largest * baseline.denominator >=
      baseline.largest * metric.denominator
    )
      continue;
    const difference =
      metric.largest * bestMetric.denominator -
      bestMetric.largest * metric.denominator;
    if (
      difference < 0 ||
      (difference === 0 &&
        (metric.events > bestMetric.events ||
          (metric.events === bestMetric.events &&
            metric.retained > bestMetric.retained)))
    ) {
      best = posts;
      bestMetric = metric;
    }
  }
  // Preserve the editor's order exactly when no improvement is possible.
  return best === original ? [...selectedPostIds] : best.map((slot) => slot.id);
}
