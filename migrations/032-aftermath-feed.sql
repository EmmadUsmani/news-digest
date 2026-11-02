-- Public RSS includes X links in encoded article content. No page harvesting.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('aftermath',NULL,'Aftermath','feed','https://aftermath.site/feed');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'aftermath' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
