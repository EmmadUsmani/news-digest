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
  return {
    rounds: summaries,
    unassignedRequestIds: evidence
      .filter((call) => !used.has(call.requestId))
      .map((call) => call.requestId),
    // Structural coverage only. Operator behavior, calibration and cheaper-model
    // acceptance still need review; this helper never chooses a winner.
    twoDayCoverage: summaries.some(
      (first, i) =>
        first.complete &&
        summaries
          .slice(i + 1)
          .some(
            (second) =>
              second.complete &&
              second.utcDay !== first.utcDay &&
              second.model === first.model &&
              JSON.stringify([...second.topicIds].sort()) ===
                JSON.stringify([...first.topicIds].sort()),
          ),
    ),
  };
}
