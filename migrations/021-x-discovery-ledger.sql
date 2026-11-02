-- Separate from Anthropic editorial funds. Unknown calls retain their reservation.
CREATE TABLE x_discovery_calls (
  id uuid PRIMARY KEY,
  model text NOT NULL CHECK (length(model) BETWEEN 1 AND 100),
  purpose text NOT NULL DEFAULT 'x-discovery' CHECK (purpose = 'x-discovery'),
  run_id text NOT NULL CHECK (length(run_id) BETWEEN 1 AND 200),
  status text NOT NULL CHECK (status IN ('pending','succeeded','failed','uncertain')),
  reserved_micros bigint NOT NULL CHECK (reserved_micros > 0),
  cost_micros bigint CHECK (cost_micros >= 0),
  input_tokens bigint CHECK (input_tokens >= 0),
  output_tokens bigint CHECK (output_tokens >= 0),
  posts_fetched bigint CHECK (posts_fetched >= 0),
  profiles_fetched bigint CHECK (profiles_fetched >= 0),
  error_code text CHECK (error_code IN ('credits-depleted','rejected','uncertain','estimate-exceeded')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  completed_at timestamptz,
  CHECK ((status = 'succeeded') = (cost_micros IS NOT NULL))
);
CREATE INDEX x_discovery_calls_created_at ON x_discovery_calls(created_at);
-- Prepaid depletion does not automatically clear at midnight or next month.
CREATE TABLE x_discovery_provider_block (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  error_code text NOT NULL CHECK (error_code = 'credits-depleted')
);
