-- Six explicit public-page probes succeeded in iteration 129, including a named
-- Phantom Blade Zero X citation. Keep exact-host checks, rotation, eight-page
-- cap and persistent one-day failure cooldown; do not recursively crawl.
UPDATE content_sources SET article_discovery_host='gamingbolt.com'
WHERE id='gamingbolt' AND article_discovery_host IS NULL;
