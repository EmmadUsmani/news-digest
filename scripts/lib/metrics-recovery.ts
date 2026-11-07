// Counter deltas locate compaction candidates; they do not prove recovery.
export interface MergeSnapshot {
  processStart: number;
  rows: number;
  merges: number;
}

export function mergeInterval(before: MergeSnapshot, after: MergeSnapshot) {
  if (
    !Object.values(before).every(Number.isFinite) ||
    !Object.values(after).every(Number.isFinite) ||
    after.processStart !== before.processStart ||
    after.rows < before.rows ||
    after.merges < before.merges
  )
    throw new Error(
      'Metrics process changed or counters invalid; discard interval',
    );
  const rows = after.rows - before.rows;
  const merges = after.merges - before.merges;
  return {
    rows,
    merges,
    // Multiple merges and non-atomic counters require journal confirmation.
    comparableMergeCandidate: rows >= 5_000_000,
    requiresJournalConfirmation: rows >= 5_000_000,
  };
}
