-- STEERING 27 freezes new production activations until the Nov 4 run is checked.
-- Keep the existing feed; defer its newly configured article-page harvesting.
UPDATE content_sources SET article_discovery_host=NULL
WHERE id='yardbarker-nba' AND article_discovery_host='www.yardbarker.com';
