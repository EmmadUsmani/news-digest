-- Public Eurogamer pages expose named X links (explicit free probe, iteration 108).
-- Keep the existing exact-host validation, publisher rotation and eight-page cap.
UPDATE content_sources SET article_discovery_host='www.eurogamer.net'
WHERE id='eurogamer' AND article_discovery_host IS NULL;
