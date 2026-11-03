-- Public basketball reporting RSS; connect only to the original NBA topic.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('basketball-insiders',NULL,'Basketball Insiders','feed','https://www.basketballinsiders.com/feed/');

INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'basketball-insiders' FROM topics
WHERE id='00000000-0000-4000-8000-000000000012';
