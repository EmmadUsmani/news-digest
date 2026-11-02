import type { RelevancePolicy, SelectedPost } from '@digest/contracts';
import type { PoolClient } from 'pg';

import {
  officialPostDisplayText,
  officialPostText,
} from '../adapters/embed-text';
import { postDuplicateKey } from '../adapters/post-duplicate-key';
import { shortlistReddit } from '../application/shortlist-reddit';
import { readRedditObservations } from '../database/reddit.repository';
import { assessPostEligibility, assessPostSafety } from '../domain/eligibility';
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
  const result = await db.query<{
    externalId: string;
    url: string;
    author: string;
    authorUrl: string;
    publishedAt: Date;
    embedHtml: string;
    metrics: Record<string, number>;
  }>(
    `SELECT p.external_id AS "externalId",p.canonical_url AS url,p.author,p.author_url AS "authorUrl",
      p.published_at AS "publishedAt",p.embed_html AS "embedHtml",p.metrics
     FROM social_posts p WHERE p.platform='x' AND p.published_at >= $2 AND p.published_at < $3 AND (
       EXISTS(SELECT 1 FROM x_link_citations c JOIN topic_source_connections t ON t.source_id=c.source_id
              WHERE c.external_id=p.external_id AND t.topic_id=$1)
       OR EXISTS(SELECT 1 FROM social_discovery_citations c JOIN social_discovery_sources s ON s.id=c.source_id
                 WHERE c.external_id=p.external_id AND s.topic_id=$1)
       OR EXISTS(SELECT 1 FROM reddit_x_citations c JOIN reddit_topic_posts r ON r.external_id=c.reddit_id
                   WHERE c.external_id=p.external_id AND r.topic_id=$1)
         OR EXISTS(SELECT 1 FROM x_search_citations c
                 WHERE c.external_id=p.external_id AND c.topic_id=$1)
     ) ORDER BY p.published_at DESC,p.external_id LIMIT 500`,
    [topicId, start, end],
  );
  const selected: SelectedPost[] = [];
  const texts = new Set<string>();
  for (const row of result.rows) {
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
      reasons: [
        assessment.reason,
        'Preliminary selection: newest verified eligible posts; conservative text/link duplicate checks; engagement and virality are not inferred.',
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
