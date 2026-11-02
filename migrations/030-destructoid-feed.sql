-- Public RSS exposes X citations in full encoded content. No page harvesting.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('destructoid',NULL,'Destructoid','feed','https://www.destructoid.com/feed/');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'destructoid' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
