-- Public pages checked explicitly in iteration 98; no X requests or inference.
-- These opt-ins reuse the shared eight-page cap, exact host checks and cooldowns.
UPDATE content_sources SET article_discovery_host='www.bbc.co.uk' WHERE id='bbc-world';
UPDATE content_sources SET article_discovery_host='www.npr.org' WHERE id='npr-world';
UPDATE content_sources SET article_discovery_host='www.gamesindustry.biz' WHERE id='gamesindustry';
UPDATE content_sources SET article_discovery_host='www.rockpapershotgun.com' WHERE id='rock-paper-shotgun';
UPDATE content_sources SET article_discovery_host='blog.playstation.com' WHERE id='playstation-blog';
UPDATE content_sources SET article_discovery_host='news.xbox.com' WHERE id='xbox-wire';
