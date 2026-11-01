-- Official publisher feeds: broaden recent coverage without crawling article pages.
INSERT INTO content_sources(id,topic_id,name,kind,url) VALUES
('yahoo-nba','00000000-0000-4000-8000-000000000012','Yahoo Sports NBA','feed','https://sports.yahoo.com/nba/rss/'),
('eurogamer','00000000-0000-4000-8000-000000000013','Eurogamer','feed','https://www.eurogamer.net/feed');
UPDATE topics t SET sources = (
 SELECT jsonb_agg(s.id ORDER BY s.id) FROM content_sources s WHERE s.topic_id=t.id
) WHERE t.id IN ('00000000-0000-4000-8000-000000000012','00000000-0000-4000-8000-000000000013');
