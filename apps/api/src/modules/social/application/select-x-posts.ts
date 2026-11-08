import type { RelevancePolicy, SelectedPost } from '@digest/contracts';

import {
  officialPostDisplayText,
  officialPostText,
} from '../adapters/embed-text';
import { postDuplicateKey } from '../adapters/post-duplicate-key';
import { assessPostEligibility, assessPostSafety } from '../domain/eligibility';
import { xEngagementSignal } from '../domain/x-engagement-ranking';
import type { XReportedEngagement } from '../domain/x-search.port';

export interface XSelectionCandidate {
  externalId: string;
  url: string;
  author: string;
  authorUrl: string;
  publishedAt: Date;
  embedHtml: string;
  metrics: Record<string, number>;
  reportedEngagement?: XReportedEngagement | null;
}

// Shared by stored posts and isolated development results. Only official embed
// text supplies evidence; discovery text and reported metrics cannot supply it.
export function selectXPosts(
  rows: readonly XSelectionCandidate[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  mode: 'lexical' | 'semantic-candidates' = 'lexical',
): SelectedPost[] {
  if (!Number.isInteger(budget) || budget <= 0) return [];
  const selected: SelectedPost[] = [];
  const texts = new Set<string>();
  const ranked = rows
    .map((row) => ({
      row,
      signal: xEngagementSignal(
        row.reportedEngagement,
        row.externalId,
        row.publishedAt,
        end,
      ),
    }))
    .sort(
      (a, b) =>
        b.signal.bonus - a.signal.bonus ||
        b.row.publishedAt.getTime() - a.row.publishedAt.getTime() ||
        a.row.externalId.localeCompare(b.row.externalId),
    );
  for (const { row, signal } of ranked) {
    const text = officialPostText(row.embedHtml);
    const publishedAt = row.publishedAt.toISOString();
    const assessment = (
      mode === 'lexical' ? assessPostEligibility : assessPostSafety
    )({ text, publishedAt }, policy, start, end);
    const key = postDuplicateKey(row.embedHtml);
    if (!assessment.eligible || texts.has(key)) continue;
    texts.add(key);
    selected.push({
      platform: 'x',
      externalId: row.externalId,
      url: row.url,
      author: row.author,
      authorUrl: row.authorUrl,
      publishedAt,
      text,
      displayText: officialPostDisplayText(row.embedHtml),
      metrics: { ...row.metrics },
      xSearchRanking: signal,
      xTriageEvidence: {
        ...(signal.reason.startsWith('Unverified xai_search') &&
        row.reportedEngagement?.likes !== undefined
          ? { reportedLikes: row.reportedEngagement.likes }
          : {}),
        media: /\bpic\.twitter\.com\//i.test(
          officialPostDisplayText(row.embedHtml),
        )
          ? 'linked'
          : 'unknown',
      },
      reasons: [
        assessment.reason,
        signal.reason,
        'Preliminary selection: topic/safety gates, reported engagement and age, then recency; conservative text/link duplicate checks.',
      ],
    });
    if (selected.length >= Math.min(mode === 'lexical' ? 20 : 200, budget))
      break;
  }
  return selected;
}
