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
