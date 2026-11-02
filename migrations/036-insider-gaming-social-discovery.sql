-- Four public reporting pages returned 200; three expose named X citations.
-- Existing bounded page collection, host cooldown and publisher rotation apply.
INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host) VALUES
('insider-gaming',NULL,'Insider Gaming','feed','https://insider-gaming.com/feed/','insider-gaming.com');

INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'insider-gaming' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
