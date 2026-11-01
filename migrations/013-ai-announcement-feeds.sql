-- First-party AI announcements are candidates, not independent corroboration.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('openai-news',NULL,'OpenAI News','feed','https://openai.com/news/rss.xml'),
('google-deepmind',NULL,'Google DeepMind','feed','https://deepmind.google/blog/rss.xml');

-- Respect deleted/replaced topics: connect only the original Tech & AI topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT t.id,s.id FROM topics t CROSS JOIN content_sources s
WHERE t.id='00000000-0000-4000-8000-000000000011'
AND s.id IN ('openai-news','google-deepmind');
