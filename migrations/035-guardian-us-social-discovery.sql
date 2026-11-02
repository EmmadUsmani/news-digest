-- Three public US reporting pages returned 200 and exposed named X citations.
-- Shares an outlet/host with Guardian World, not independent coverage evidence.
-- Existing publisher rotation, eight-page cap and failed-host cooldown apply.
INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host) VALUES
('guardian-us',NULL,'The Guardian US','feed','https://www.theguardian.com/us-news/rss','www.theguardian.com');

-- Respect deletion/replacement of the original World news & politics topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'guardian-us' FROM topics
WHERE id='00000000-0000-4000-8000-000000000014';
