-- Public publisher RSS carries X citations without article-page requests.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('gamesradar',NULL,'GamesRadar+','feed','https://www.gamesradar.com/feeds.xml'),
('gamespot',NULL,'GameSpot','feed','https://www.gamespot.com/feeds/mashup/');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,source_id FROM topics
CROSS JOIN (VALUES ('gamesradar'),('gamespot')) AS feeds(source_id)
WHERE id='00000000-0000-4000-8000-000000000013';
