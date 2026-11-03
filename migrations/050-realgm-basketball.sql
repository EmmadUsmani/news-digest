-- Public basketball wiretap RSS; NBA relevance remains the topic ranker's job.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('realgm-basketball',NULL,'RealGM Basketball','feed','https://basketball.realgm.com/rss/wiretap/0/0.xml');

-- Respect deletion/replacement of the original NBA topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'realgm-basketball' FROM topics
WHERE id='00000000-0000-4000-8000-000000000012';
