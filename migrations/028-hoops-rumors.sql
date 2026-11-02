-- Public NBA RSS includes reporter/team X links; no article-page crawling.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('hoops-rumors',NULL,'Hoops Rumors','feed','https://www.hoopsrumors.com/feed');

-- Respect deletion/replacement of the original NBA topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'hoops-rumors' FROM topics
WHERE id='00000000-0000-4000-8000-000000000012';
