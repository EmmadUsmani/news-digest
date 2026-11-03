ALTER TABLE x_discovery_calls DROP CONSTRAINT x_discovery_calls_search_type_check;
ALTER TABLE x_discovery_calls ADD CONSTRAINT x_discovery_calls_search_type_check
  CHECK (search_type IN ('open-topic', 'account-list', 'story-reactions'));
