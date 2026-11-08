import type { RelevancePolicy, SelectedPost } from '@digest/contracts';
import type { PoolClient } from 'pg';

import { selectXPosts } from '../application/select-x-posts';
import { shortlistReddit } from '../application/shortlist-reddit';
import { readRedditObservations } from '../database/reddit.repository';
import { readSelectionPosts } from '../database/selection.reader';
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
  return selectXPosts(rows, policy, start, end, budget, mode);
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
