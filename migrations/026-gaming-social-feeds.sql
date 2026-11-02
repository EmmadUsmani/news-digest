-- Public RSS includes publisher-selected X citations; no article crawling needed.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('gamingbolt',NULL,'GamingBolt','feed','https://gamingbolt.com/feed'),
('push-square',NULL,'Push Square','feed','https://www.pushsquare.com/feeds/latest');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,source_id FROM topics
CROSS JOIN (VALUES ('gamingbolt'),('push-square')) AS feeds(source_id)
WHERE id='00000000-0000-4000-8000-000000000013';
