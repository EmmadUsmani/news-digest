import type { DigestPreview, SelectedSocialPost } from '@digest/contracts';
import type { PoolClient } from 'pg';

import { readStoryCitations } from '../database/selection.reader';

// Citation provenance is an explicit relationship, not a semantic same-event claim.
// Only selected stories in this topic may become internal edition links.
export async function linkCitingStories(
  db: Pick<PoolClient, 'query'>,
  posts: SelectedSocialPost[],
  stories: DigestPreview['topics'][number]['stories'],
): Promise<SelectedSocialPost[]> {
  if (!posts.length || !stories.length) return posts;
  const members = (story: (typeof stories)[number]) =>
    new Set([
      story.id,
      ...(story.coverage ?? []).map((item) => item.id),
      ...(story.evidence ?? []).map((item) => item.id),
    ]);
  const ids = [...new Set(stories.flatMap((story) => [...members(story)]))];
  const rows = await readStoryCitations(
    db,
    posts
      .filter((post) => post.platform === 'x')
      .map((post) => post.externalId),
    ids,
  );
  return posts.map((post) => ({
    ...post,
    citingStories: stories
      .filter((story) =>
        rows.some(
          (row) =>
            post.platform === 'x' &&
            row.externalId === post.externalId &&
            members(story).has(row.itemId),
        ),
      )
      .map((story) => ({ id: story.id, title: story.title })),
  }));
}
