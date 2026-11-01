CREATE TABLE topic_source_connections (
 topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
 source_id text NOT NULL REFERENCES content_sources(id),
 PRIMARY KEY(topic_id,source_id)
);
INSERT INTO topic_source_connections(topic_id,source_id) SELECT topic_id,id FROM content_sources;
