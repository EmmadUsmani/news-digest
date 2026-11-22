// Prepare a bounded regrouping input from an already validated partition.
// Membership must come from grouping, never title/word matching. This does not
// validate a later model response or replace the original coverage membership.
export function eventAdmission<T extends { id: string }>(
  ranked: readonly T[],
  baseline: readonly T[],
  groups: readonly { ids: readonly string[] }[],
  limit: number,
): T[] | null {
  if (
    !Number.isInteger(limit) ||
    limit < 0 ||
    baseline.length > limit ||
    new Set(ranked.map(({ id }) => id)).size !== ranked.length ||
    new Set(baseline.map(({ id }) => id)).size !== baseline.length
  )
    return null;
  const byId = new Map(baseline.map((item) => [item.id, item]));
  const membership = new Map<string, number>();
  for (const [index, group] of groups.entries()) {
    if (!group.ids.length) return null;
    for (const id of group.ids) {
      if (!byId.has(id) || membership.has(id)) return null;
      membership.set(id, index);
    }
  }
  if (
    membership.size !== baseline.length ||
    baseline.some(({ id }) => !ranked.some((item) => item.id === id))
  )
    return null;
  const represented = new Set<number>();
  const selected = new Set<string>();
  // Choose the highest-ranked report of every baseline event first.
  for (const item of ranked) {
    const group = membership.get(item.id);
    if (group === undefined || represented.has(group)) continue;
    represented.add(group);
    selected.add(item.id);
  }
  // Spend the released slots on unseen reports before corroborating reports.
  for (const item of ranked) {
    if (selected.size >= limit) break;
    if (!membership.has(item.id)) selected.add(item.id);
  }
  for (const item of ranked) {
    if (selected.size >= limit) break;
    selected.add(item.id);
  }
  return ranked.filter(({ id }) => selected.has(id));
}

// Restore corroborating reports omitted from a bounded regrouping request.
// Refuse changed baseline event boundaries/ownership rather than silently
// treating a new partition as proof that the old events survived.
export function restoreEventCoverage<
  T extends { ids: readonly string[]; topicId: string },
>(
  baseline: readonly T[],
  admitted: readonly string[],
  regrouped: readonly T[],
): T[] | null {
  const original = new Map<string, number>();
  for (const [index, group] of baseline.entries()) {
    if (!group.topicId || !group.ids.length) return null;
    for (const id of group.ids) {
      if (!id || original.has(id)) return null;
      original.set(id, index);
    }
  }
  const input = new Set(admitted);
  if (input.size !== admitted.length || input.has('')) return null;
  const seen = new Set<string>();
  const destination = new Map<number, number>();
  for (const [index, group] of regrouped.entries()) {
    if (!group.topicId || !group.ids.length) return null;
    const ancestors = new Set<number>();
    for (const id of group.ids) {
      if (!input.has(id) || seen.has(id)) return null;
      seen.add(id);
      const ancestor = original.get(id);
      if (ancestor === undefined) continue;
      if (baseline[ancestor].topicId !== group.topicId) return null;
      ancestors.add(ancestor);
      const previous = destination.get(ancestor);
      if (previous !== undefined && previous !== index) return null;
      destination.set(ancestor, index);
    }
    if (ancestors.size > 1) return null;
  }
  if (seen.size !== input.size || destination.size !== baseline.length)
    return null;
  const result = regrouped.map((group) => ({ ...group, ids: [...group.ids] }));
  for (const [ancestor, index] of destination) {
    for (const id of baseline[ancestor].ids)
      if (!seen.has(id)) {
        result[index].ids.push(id);
        seen.add(id);
      }
  }
  return result;
}

// Apply a per-topic editor cutoff only after original coverage is restored.
// Reserve slots for every previously admitted event, then fill by new ranking.
export function editorEventAdmission<
  T extends { ids: readonly string[]; topicId: string },
>(ranked: readonly T[], baseline: readonly T[], limit: number): T[] | null {
  if (
    !Number.isInteger(limit) ||
    limit < 0 ||
    baseline.length > limit ||
    new Set([...ranked, ...baseline].map((group) => group.topicId)).size > 1
  )
    return null;
  const ids = ranked.flatMap((group) => [...group.ids]);
  const restored = restoreEventCoverage(baseline, ids, ranked);
  // A cutoff must never conceal incomplete evidence restoration.
  if (
    !restored ||
    restored.some((group, i) => group.ids.length !== ranked[i].ids.length)
  )
    return null;
  const original = new Set(baseline.flatMap((group) => [...group.ids]));
  const selected = new Set<number>();
  ranked.forEach((group, i) => {
    if (group.ids.some((id) => original.has(id))) selected.add(i);
  });
  for (let i = 0; i < ranked.length && selected.size < limit; i++)
    selected.add(i);
  return ranked.filter((_, i) => selected.has(i));
}
