-- Public aggregator pages are discovery evidence, never article/post content.
CREATE TABLE social_discovery_sources (
  id text PRIMARY KEY,
  topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  name text NOT NULL,
  url text NOT NULL UNIQUE,
  last_success timestamptz,
  last_error text,
  last_link_count integer
);
CREATE TABLE social_discovery_citations (
  source_id text NOT NULL REFERENCES social_discovery_sources(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  canonical_url text NOT NULL,
  verification_url text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(source_id,external_id)
);
INSERT INTO social_discovery_sources(id,topic_id,name,url)
SELECT 'techmeme',id,'Techmeme river','https://www.techmeme.com/' FROM topics
WHERE id='00000000-0000-4000-8000-000000000011';
INSERT INTO social_discovery_sources(id,topic_id,name,url)
SELECT 'memeorandum',id,'Memeorandum river','https://www.memeorandum.com/' FROM topics
WHERE id='00000000-0000-4000-8000-000000000014';

ALTER TABLE x_link_citations ADD COLUMN verification_url text;
