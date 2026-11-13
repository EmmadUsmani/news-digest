import type { XReportedEngagement } from './x-search.port';

// A single model-reported snapshot supplies a lifetime rate, not measured growth.
// Log scaling bounds the signal for later combination with semantic scores.
export function xEngagementSignal(
  report: XReportedEngagement | null | undefined,
  externalId: string,
  publishedAt: Date,
  end: Date,
): { bonus: number; reason: string } {
  const unknown = {
    bonus: 0,
    reason:
      'No usable X search engagement report; unknown counts are not zero.',
  };
  if (
    !report ||
    report.externalId !== externalId ||
    report.reported_by !== 'xai_search'
  )
    return unknown;
  const observed = Date.parse(report.observedAt);
  const published = publishedAt.getTime();
  const cutoff = end.getTime();
  if (
    !Number.isFinite(observed) ||
    !Number.isFinite(published) ||
    !Number.isFinite(cutoff) ||
    observed > cutoff ||
    observed < published
  )
    return unknown;
  const counts = [report.likes, report.reposts, report.replies, report.views];
  if (
    counts.every((n) => n === undefined) ||
    counts.some((n) => n !== undefined && (!Number.isSafeInteger(n) || n < 0))
  )
    return unknown;
  const engagement =
    (report.likes ?? 0) +
    2 * (report.reposts ?? 0) +
    (report.replies ?? 0) +
    0.01 * (report.views ?? 0);
  const ageHours = Math.max(1, (observed - published) / 3_600_000);
  const rate = engagement / ageHours;
  const bonus = Math.min(
    2,
    (Math.log10(1 + engagement) + Math.log10(1 + rate)) / 4,
  );
  return {
    bonus,
    reason: `Unverified xai_search engagement observed ${report.observedAt}: ${counts.map((n, i) => `${['likes', 'reposts', 'replies', 'views'][i]} ${n ?? 'unknown'}`).join(', ')}. Bounded ranking bonus ${bonus.toFixed(2)}/2; lifetime weighted engagement/hour ${rate.toFixed(1)} is an age proxy, not measured growth.`,
  };
}
