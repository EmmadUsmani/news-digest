import type { RelevancePolicy, SelectedPost } from '@digest/contracts';
import type { PoolClient } from 'pg';

import {
  officialPostDisplayText,
  officialPostText,
} from '../adapters/embed-text';
import { postDuplicateKey } from '../adapters/post-duplicate-key';
import { shortlistReddit } from '../application/shortlist-reddit';
import { readRedditObservations } from '../database/reddit.repository';
import { readSelectionPosts } from '../database/selection.reader';
import { assessPostEligibility, assessPostSafety } from '../domain/eligibility';
import { xEngagementSignal } from '../domain/x-engagement-ranking';
import { snapshotRedditPost } from './reddit-snapshot';

// Use the publisher's transaction so source configuration, posts and stories
// share one database snapshot. No network or inference during post selection.
export async function selectTopicPosts(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
  mode: 'lexical' | 'semantic-candidates' = 'lexical',
): Promise<SelectedPost[]> {
  if (!Number.isInteger(budget) || budget <= 0) return [];
  const rows = await readSelectionPosts(db, topicId, start, end);
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

// Read through the publisher transaction; never open a second snapshot or fetch.
export async function selectTopicRedditPosts(
  db: Pick<PoolClient, 'query'>,
  topicId: string,
  policy: RelevancePolicy,
  start: Date,
  end: Date,
  budget: number,
) {
  return (
    await shortlistReddit(
      {
        observations: (id, from, to) =>
          readRedditObservations(db, id, from, to),
      },
      topicId,
      policy,
      start,
      end,
      budget,
    )
  ).map(snapshotRedditPost);
}
