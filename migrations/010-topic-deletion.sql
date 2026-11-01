-- Connections own source membership. Keep legacy provenance nullable so removing
-- a topic preserves the shared source catalog and every collected observation.
ALTER TABLE content_sources ALTER COLUMN topic_id DROP NOT NULL;
ALTER TABLE content_sources DROP CONSTRAINT content_sources_topic_id_fkey;
ALTER TABLE content_sources ADD CONSTRAINT content_sources_topic_id_fkey
 FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL;
