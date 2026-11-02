-- Snapshot attribution before HTTP, including failed and zero-citation calls.
-- No FK: retained cost evidence survives topic rename/deletion. Historical
-- calls stay NULL rather than guessing which request produced their citations.
ALTER TABLE x_discovery_calls ADD COLUMN requested_topic jsonb;
ALTER TABLE x_discovery_calls ADD CONSTRAINT x_discovery_requested_topic_shape
CHECK (requested_topic IS NULL OR (
  jsonb_typeof(requested_topic) = 'object'
  AND requested_topic ? 'id' AND requested_topic ? 'name'
  AND jsonb_typeof(requested_topic->'id') = 'string'
  AND jsonb_typeof(requested_topic->'name') = 'string'
));
