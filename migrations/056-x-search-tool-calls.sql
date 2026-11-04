-- Historical calls remain NULL: requested prompts do not prove executed queries.
ALTER TABLE x_discovery_calls ADD COLUMN tool_calls jsonb;
