CREATE TABLE content_sources (
 id text PRIMARY KEY, topic_id uuid NOT NULL REFERENCES topics(id), name text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('feed','hn')), url text NOT NULL,
 last_attempt timestamptz, last_success timestamptz, last_error text,
 last_item_count integer NOT NULL DEFAULT 0
);
CREATE TABLE content_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), canonical_url text UNIQUE NOT NULL,
 title text NOT NULL, excerpt text NOT NULL, author text, published_at timestamptz NOT NULL,
 fetched_at timestamptz NOT NULL DEFAULT now(), image_url text, engagement jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE content_observations (
 source_id text REFERENCES content_sources(id), item_id uuid REFERENCES content_items(id),
 PRIMARY KEY(source_id,item_id)
);
CREATE INDEX content_items_published ON content_items(published_at DESC);
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('verge','00000000-0000-4000-8000-000000000011','The Verge','feed','https://www.theverge.com/rss/index.xml'),
('hn','00000000-0000-4000-8000-000000000011','Hacker News','hn','https://hacker-news.firebaseio.com/v0/topstories.json'),
('cbs-nba','00000000-0000-4000-8000-000000000012','CBS Sports NBA','feed','https://www.cbssports.com/rss/headlines/nba/'),
('gamesindustry','00000000-0000-4000-8000-000000000013','GamesIndustry.biz','feed','https://www.gamesindustry.biz/feed'),
('bbc-world','00000000-0000-4000-8000-000000000014','BBC World','feed','https://feeds.bbci.co.uk/news/world/rss.xml');
UPDATE topics t SET sources=(SELECT jsonb_agg(s.id ORDER BY s.id) FROM content_sources s WHERE s.topic_id=t.id);
