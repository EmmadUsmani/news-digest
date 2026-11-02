-- Storage preparation only; no scheduler or public fetching is enabled.
ALTER TABLE social_posts DROP CONSTRAINT social_posts_platform_check;
ALTER TABLE social_posts DROP CONSTRAINT social_posts_external_id_check;
ALTER TABLE social_posts ADD CHECK (platform IN ('x','reddit'));
ALTER TABLE social_posts ADD CHECK (
  (platform='x' AND external_id ~ '^[1-9][0-9]{0,19}$') OR
  (platform='reddit' AND external_id ~ '^[a-z0-9]{1,20}$')
);
ALTER TABLE social_posts ADD COLUMN reddit_metadata jsonb;
ALTER TABLE social_posts ADD CHECK (platform <> 'reddit' OR
  (reddit_metadata IS NOT NULL AND jsonb_typeof(reddit_metadata)='object'));
CREATE TABLE reddit_topic_posts (
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  platform text NOT NULL DEFAULT 'reddit' CHECK(platform='reddit'),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(topic_id,external_id),
  FOREIGN KEY(platform,external_id) REFERENCES social_posts(platform,external_id) ON DELETE CASCADE
);
