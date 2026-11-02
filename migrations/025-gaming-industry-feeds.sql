-- Public RSS probes succeeded; publisher pages return 403, so harvesting stays off.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('game-developer',NULL,'Game Developer','feed','https://www.gamedeveloper.com/rss.xml'),
('vgc',NULL,'Video Games Chronicle','feed','https://www.videogameschronicle.com/feed/');

-- Connect only the original Gaming topic; respect owner deletion/replacement.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,source_id FROM topics
CROSS JOIN (VALUES ('game-developer'),('vgc')) AS feeds(source_id)
WHERE id='00000000-0000-4000-8000-000000000013';
