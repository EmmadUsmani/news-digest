-- Public RSS is available; article pages return 403, so do not opt into harvesting.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('nintendo-life',NULL,'Nintendo Life','feed','https://www.nintendolife.com/feeds/latest');

-- Connect only the original Gaming topic; respect owner deletion/replacement.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'nintendo-life' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
