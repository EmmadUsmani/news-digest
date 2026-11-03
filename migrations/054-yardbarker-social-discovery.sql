-- Public NBA pages expose named X embeds. Use the existing eight-page hourly
-- rotation, exact-host checks and persistent publisher failure cooldown.
UPDATE content_sources SET article_discovery_host='www.yardbarker.com'
WHERE id='yardbarker-nba' AND article_discovery_host IS NULL;
