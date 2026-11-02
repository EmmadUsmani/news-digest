-- Citations are discovery evidence; only official oEmbed verification creates X posts.
CREATE TABLE reddit_x_citations (
  reddit_id text NOT NULL,
  platform text NOT NULL DEFAULT 'reddit' CHECK(platform='reddit'),
  external_id text NOT NULL CHECK(external_id ~ '^[1-9][0-9]{0,19}$'),
  canonical_url text NOT NULL,
  verification_url text,
  citing_engagement double precision NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(reddit_id,external_id),
  FOREIGN KEY(platform,reddit_id) REFERENCES social_posts(platform,external_id) ON DELETE CASCADE
);
CREATE INDEX reddit_x_citations_external_idx ON reddit_x_citations(external_id);
