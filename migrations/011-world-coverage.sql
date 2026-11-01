-- Broaden world reporting through public publisher RSS; no article-page crawling.
-- Only connect to the original seed topic if it still exists.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('npr-world',NULL,'NPR World','feed','https://feeds.npr.org/1004/rss.xml'),
('guardian-world',NULL,'The Guardian World','feed','https://www.theguardian.com/world/rss');

INSERT INTO topic_source_connections(topic_id,source_id)
SELECT t.id,s.id FROM topics t CROSS JOIN content_sources s
WHERE t.id='00000000-0000-4000-8000-000000000014'
AND s.id IN ('npr-world','guardian-world');
