-- Broader PC gaming reporting; outlet labels do not prove independence.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('pc-gamer',NULL,'PC Gamer','feed','https://www.pcgamer.com/rss/'),
('rock-paper-shotgun',NULL,'Rock Paper Shotgun','feed','https://www.rockpapershotgun.com/feed');

-- Respect deleted/replaced topics: connect only the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT t.id,s.id FROM topics t CROSS JOIN content_sources s
WHERE t.id='00000000-0000-4000-8000-000000000013'
AND s.id IN ('pc-gamer','rock-paper-shotgun');
