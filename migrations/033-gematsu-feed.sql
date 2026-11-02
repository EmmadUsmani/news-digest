-- Public RSS for release, studio and platform reporting. Article pages return
-- 403; do not enable page harvesting or infer social posts from article titles.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('gematsu',NULL,'Gematsu','feed','https://www.gematsu.com/feed');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'gematsu' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
