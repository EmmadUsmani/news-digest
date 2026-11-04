import {
  type XExperimentEvidence,
  xExperimentReport,
} from './x-experiment-report';

export interface XComparisonRound {
  model: string;
  topicIds: string[];
  calls: { requestId: string; startedAt: string }[];
}

// Round membership and dispatch times are explicit saved evidence, never
// inferred from publication times or the requested edition window.
export function xExperimentComparison(
  evidence: XExperimentEvidence[],
  rounds: XComparisonRound[],
) {
  const reports = new Map(
    xExperimentReport(evidence).map((call) => [call.requestId, call]),
  );
  const used = new Set<string>();
  const dailyCosts = new Map<string, number>();
  const forbiddenRequestIds: string[] = [];
  const summaries = rounds.map((round) => {
    if (
      !round.model.trim() ||
      round.topicIds.length !== 4 ||
      new Set(round.topicIds).size !== 4 ||
      round.topicIds.some((id) => !id.trim())
    )
      throw new Error('Comparison requires four explicit distinct topics');
    const cells = new Map<string, number>();
    const windows = new Set<string>();
    const days = new Set<string>();
    const times: number[] = [];
    const calls = round.calls.map((saved) => {
      const call = reports.get(saved.requestId);
      const time = Date.parse(saved.startedAt);
      if (
        !call ||
        used.has(saved.requestId) ||
        !Number.isFinite(time) ||
        !/(Z|[+-]\d{2}:\d{2})$/.test(saved.startedAt) ||
        call.model !== round.model ||
        !round.topicIds.includes(call.topicId)
      )
        throw new Error('Invalid comparison round evidence');
      used.add(saved.requestId);
      const dispatched = new Date(time);
      const day = dispatched.toISOString().slice(0, 10);
      const dailyCost = (dailyCosts.get(day) ?? 0) + call.costMicros;
      if (!Number.isSafeInteger(dailyCost))
        throw new Error('Comparison cost overflow');
      dailyCosts.set(day, dailyCost);
      if (dispatched.getUTCHours() >= 13 && dispatched.getUTCHours() < 16)
        forbiddenRequestIds.push(call.requestId);
      times.push(time);
      days.add(new Date(time).toISOString().slice(0, 10));
      windows.add(
        `${Date.parse(call.window.start)}/${Date.parse(call.window.end)}`,
      );
      const key = `${call.topicId}/${call.style}`;
      cells.set(key, (cells.get(key) ?? 0) + 1);
      return call;
    });
    const missing = round.topicIds.flatMap((topicId) =>
      (['current', 'trending', 'reactions'] as const)
        .filter((style) => !cells.has(`${topicId}/${style}`))
        .map((style) => ({ topicId, style })),
    );
    const duplicateCells = [...cells]
      .filter(([, count]) => count > 1)
      .map(([cell]) => cell);
    const spanMs = times.length
      ? Math.max(...times) - Math.min(...times)
      : null;
    const complete =
      missing.length === 0 &&
      duplicateCells.length === 0 &&
      windows.size === 1 &&
      days.size === 1 &&
      spanMs !== null &&
      spanMs <= 3_600_000;
    return {
      model: round.model,
      topicIds: round.topicIds,
      utcDay: days.size === 1 ? [...days][0] : null,
      spanMs,
      sameWindow: windows.size === 1,
      window:
        windows.size === 1
          ? {
              start: new Date(calls[0].window.start).toISOString(),
              end: new Date(calls[0].window.end).toISOString(),
            }
          : null,
      missing,
      duplicateCells,
      complete,
      styles: (['current', 'trending', 'reactions'] as const).map((style) => {
        const selected = calls.filter((call) => call.style === style);
        const costMicros = selected.reduce(
          (sum, call) => sum + call.costMicros,
          0,
        );
        if (!Number.isSafeInteger(costMicros))
          throw new Error('Comparison cost overflow');
        const eligiblePosts = selected.every(
          (call) => call.eligiblePosts !== null,
        )
          ? selected.reduce((sum, call) => sum + (call.eligiblePosts ?? 0), 0)
          : null;
        return {
          style,
          costMicros,
          eligiblePosts,
          zeroPromotions: selected.some((call) => call.zeroPromotions === false)
            ? false
            : selected.length &&
                selected.every((call) => call.zeroPromotions === true)
              ? true
              : null,
          eligiblePostsPerDollar:
            complete && eligiblePosts !== null && costMicros > 0
              ? (eligiblePosts * 1_000_000) / costMicros
              : null,
        };
      }),
    };
  });
  const totalCostMicros = evidence.reduce(
    (sum, call) => sum + call.costMicros,
    0,
  );
  if (!Number.isSafeInteger(totalCostMicros))
    throw new Error('Comparison cost overflow');
  const unassignedRequestIds = evidence
    .filter((call) => !used.has(call.requestId))
    .map((call) => call.requestId);
  const days = [...dailyCosts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([utcDay, costMicros]) => ({
      utcDay,
      costMicros,
      withinCap: costMicros <= 1_000_000,
    }));
  return {
    // Saved calls only: this cannot establish completeness of the spend ledger
    // or account for outstanding reservations. Unassigned calls lack timing.
    guardrails: {
      totalCostMicros,
      totalWithinCap: totalCostMicros <= 2_500_000,
      days,
      forbiddenRequestIds,
      compliant:
        totalCostMicros > 2_500_000 ||
        days.some((day) => !day.withinCap) ||
        forbiddenRequestIds.length
          ? false
          : !evidence.length || unassignedRequestIds.length
            ? null
            : true,
    },
    rounds: summaries,
    unassignedRequestIds,
    // Structural coverage only. Operator behavior, calibration and cheaper-model
    // acceptance still need review; this helper never chooses a winner.
    // Separate dispatch days must also cover independent news windows, not
    // repeated or overlapping searches of the same stories.
    twoDayCoverage: summaries.some(
      (first, i) =>
        first.complete &&
        summaries
          .slice(i + 1)
          .some(
            (second) =>
              second.complete &&
              second.utcDay !== first.utcDay &&
              first.window !== null &&
              second.window !== null &&
              (Date.parse(first.window.end) <=
                Date.parse(second.window.start) ||
                Date.parse(second.window.end) <=
                  Date.parse(first.window.start)) &&
              second.model === first.model &&
              JSON.stringify([...second.topicIds].sort()) ===
                JSON.stringify([...first.topicIds].sort()),
          ),
    ),
  };
}
