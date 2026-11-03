-- Public NBA Atom feed; publisher excerpts also supply free X citations.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('sbnation-nba',NULL,'SB Nation NBA','feed','https://www.sbnation.com/rss/nba/index.xml');

-- Respect deletion/replacement of the original NBA topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'sbnation-nba' FROM topics
WHERE id='00000000-0000-4000-8000-000000000012';
