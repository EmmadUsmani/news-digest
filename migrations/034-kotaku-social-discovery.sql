-- Public RSS plus exact-host article discovery: three explicit public-page
-- probes returned 200; two exposed named X citations. Existing eight-page cap,
-- publisher rotation and persistent failure cooldown apply; no recursive crawl.
INSERT INTO content_sources(id,topic_id,name,kind,url,article_discovery_host) VALUES
('kotaku',NULL,'Kotaku','feed','https://kotaku.com/rss','kotaku.com');

-- Respect deletion/replacement of the original Gaming topic.
INSERT INTO topic_source_connections(topic_id,source_id)
SELECT id,'kotaku' FROM topics
WHERE id='00000000-0000-4000-8000-000000000013';
