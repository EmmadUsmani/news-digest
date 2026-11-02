-- Unverified discovery evidence, deliberately separate from publishable social posts.
CREATE TABLE x_link_citations (
  external_id text NOT NULL CHECK (external_id ~ '^[0-9]{1,20}$'),
  item_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES content_sources(id) ON DELETE CASCADE,
  canonical_url text NOT NULL,
  citing_engagement jsonb NOT NULL DEFAULT '{}',
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(external_id,item_id,source_id)
);
CREATE INDEX x_link_citations_item ON x_link_citations(item_id);
