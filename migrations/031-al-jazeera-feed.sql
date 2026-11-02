-- General public RSS broadens World reporting; no publisher-page harvesting.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('al-jazeera',NULL,'Al Jazeera','feed','https://www.aljazeera.com/xml/rss/all.xml');

-- Respect deletion/replacement of the original World topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'al-jazeera' FROM topics
WHERE id='00000000-0000-4000-8000-000000000014';
