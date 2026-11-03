-- Public NBA RSS, including syndicated reports; do not recreate a deleted topic.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('yardbarker-nba',NULL,'Yardbarker NBA','feed','https://www.yardbarker.com/rss/sport/3');

INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'yardbarker-nba' FROM topics
WHERE id='00000000-0000-4000-8000-000000000012';
