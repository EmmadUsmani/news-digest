CREATE TABLE social_posts (
  platform text NOT NULL CHECK(platform = 'x'),
  external_id text NOT NULL CHECK(external_id ~ '^[1-9][0-9]{0,19}$'),
  canonical_url text NOT NULL,
  author text NOT NULL,
  author_url text NOT NULL,
  published_at timestamptz,
  metrics jsonb NOT NULL DEFAULT '{}',
  embed_html text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(platform, external_id)
);
CREATE TABLE x_embed_checks (
  external_id text PRIMARY KEY,
  checked_at timestamptz NOT NULL DEFAULT now(),
  error text
);
