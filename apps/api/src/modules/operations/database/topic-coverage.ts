import type { Pool } from 'pg';

// Collection scope is not an editorial relevance or quality assessment.
export async function readTopicCoverage(db: Pick<Pool, 'query'>, end: Date) {
  const start = new Date(end.getTime() - 86400000);
  const { rows } = await db.query(
    `WITH post_topics AS (
      SELECT 'x' AS platform,c.external_id,t.topic_id FROM x_link_citations c
        JOIN topic_source_connections t ON t.source_id=c.source_id
      UNION SELECT 'x',c.external_id,s.topic_id FROM social_discovery_citations c
        JOIN social_discovery_sources s ON s.id=c.source_id
      UNION SELECT 'x',external_id,topic_id FROM x_search_citations
      UNION SELECT 'x',c.external_id,r.topic_id FROM reddit_x_citations c
        JOIN reddit_topic_posts r ON r.external_id=c.reddit_id
      UNION SELECT 'reddit',external_id,topic_id FROM reddit_topic_posts
    )
    SELECT t.id AS "topicId",t.name,t.enabled,
      (SELECT count(*)::int FROM topic_source_connections c
        WHERE c.topic_id=t.id) AS "connectedSources",
      (SELECT count(*)::int FROM topic_source_connections c JOIN content_sources s ON s.id=c.source_id
        WHERE c.topic_id=t.id AND s.last_error IS NULL
          AND s.last_success >= $2::timestamptz - interval '1 hour'
          AND s.last_success <= $2::timestamptz) AS "healthySources",
      (SELECT count(DISTINCT i.id)::int FROM topic_source_connections c
        JOIN content_observations o ON o.source_id=c.source_id
        JOIN content_items i ON i.id=o.item_id WHERE c.topic_id=t.id
          AND i.published_at >= $1 AND i.published_at < $2) AS articles,
      (SELECT count(*)::int FROM post_topics a JOIN social_posts p
        ON p.platform=a.platform AND p.external_id=a.external_id
        WHERE a.topic_id=t.id AND p.platform='x'
          AND p.published_at >= $1 AND p.published_at < $2) AS "xPosts",
      (SELECT count(*)::int FROM post_topics a JOIN social_posts p
        ON p.platform=a.platform AND p.external_id=a.external_id
        WHERE a.topic_id=t.id AND p.platform='reddit'
          AND p.published_at >= $1 AND p.published_at < $2) AS "redditPosts"
    FROM topics t ORDER BY t.position,t.id`,
    [start, end],
  );
  return { start: start.toISOString(), end: end.toISOString(), topics: rows };
}
