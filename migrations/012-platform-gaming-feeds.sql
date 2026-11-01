-- Direct platform announcements supplement publisher coverage; these are
-- first-party promotional sources, not independent corroboration.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('playstation-blog',NULL,'PlayStation Blog','feed','https://blog.playstation.com/feed/'),
('xbox-wire',NULL,'Xbox Wire','feed','https://news.xbox.com/en-us/feed/');

-- Respect deleted/replaced topics: only connect the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT t.id,s.id FROM topics t CROSS JOIN content_sources s
WHERE t.id='00000000-0000-4000-8000-000000000013'
AND s.id IN ('playstation-blog','xbox-wire');
