-- Storage preparation only: no collection schedule or edition inclusion.
ALTER TABLE social_posts DROP CONSTRAINT social_posts_platform_check;
ALTER TABLE social_posts DROP CONSTRAINT social_posts_check;
ALTER TABLE social_posts ADD CHECK (platform IN ('x','reddit','bluesky'));
ALTER TABLE social_posts ADD CHECK (
  (platform='x' AND external_id ~ '^[1-9][0-9]{0,19}$') OR
  (platform='reddit' AND external_id ~ '^[a-z0-9]{1,20}$') OR
  (platform='bluesky' AND external_id ~ '^at://did:[a-z0-9]+:[A-Za-z0-9.:%_-]+/app\.bsky\.feed\.post/[A-Za-z0-9]+$')
);
ALTER TABLE social_posts ADD COLUMN bluesky_metadata jsonb;
ALTER TABLE social_posts ADD CHECK (platform <> 'bluesky' OR
  (bluesky_metadata IS NOT NULL AND jsonb_typeof(bluesky_metadata)='object'));
CREATE TABLE bluesky_observations (
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'bluesky' CHECK(platform='bluesky'),
  external_id text NOT NULL,
  observed_at timestamptz NOT NULL,
  published_at timestamptz NOT NULL,
  snapshot jsonb NOT NULL CHECK(jsonb_typeof(snapshot)='object'),
  PRIMARY KEY(topic_id, external_id, observed_at),
  FOREIGN KEY(platform, external_id) REFERENCES social_posts(platform,external_id) ON DELETE CASCADE,
  CHECK(observed_at >= published_at)
);
CREATE INDEX bluesky_observations_window ON bluesky_observations(topic_id,published_at,observed_at);
