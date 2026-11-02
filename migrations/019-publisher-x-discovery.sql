-- Opt-in publisher pages only; feed URLs and existing ingestion stay unchanged.
ALTER TABLE content_sources ADD COLUMN article_discovery_host text;
UPDATE content_sources SET article_discovery_host='www.theguardian.com' WHERE id='guardian-world';
UPDATE content_sources SET article_discovery_host='www.pcgamer.com' WHERE id='pc-gamer';
UPDATE content_sources SET article_discovery_host='www.eurogamer.net' WHERE id='eurogamer';
UPDATE content_sources SET article_discovery_host='sports.yahoo.com' WHERE id='yahoo-nba';
UPDATE content_sources SET article_discovery_host='arstechnica.com' WHERE url='https://arstechnica.com/feed/';
CREATE TABLE article_x_discovery_checks (
  item_id uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  link_count integer NOT NULL DEFAULT 0 CHECK (link_count BETWEEN 0 AND 50)
);
