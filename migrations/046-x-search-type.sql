-- No inference from historical handles/run IDs: old search types stay unknown.
ALTER TABLE x_discovery_calls ADD COLUMN search_type text
  CHECK (search_type IN ('open-topic', 'account-list'));
