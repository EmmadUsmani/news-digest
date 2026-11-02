-- Money is integer microdollars. Pending/uncertain calls retain their worst-case
-- reservation, including across UTC day/month boundaries; never retry on expiry.
CREATE TABLE llm_calls (
 id uuid PRIMARY KEY,
 model text NOT NULL,
 purpose text NOT NULL,
 run_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz,
 status text NOT NULL CHECK (status IN ('pending','succeeded','failed','uncertain')),
 reserved_micros bigint NOT NULL CHECK (reserved_micros >= 0),
 cost_micros bigint CHECK (cost_micros >= 0),
 input_tokens integer CHECK (input_tokens >= 0),
 cache_write_tokens integer CHECK (cache_write_tokens >= 0),
 cache_read_tokens integer CHECK (cache_read_tokens >= 0),
 output_tokens integer CHECK (output_tokens >= 0),
 error_code text,
 CHECK ((status = 'succeeded') = (cost_micros IS NOT NULL))
);
CREATE INDEX llm_calls_created ON llm_calls(created_at);
CREATE TABLE llm_provider_blocks (
 month_start date PRIMARY KEY,
 error_code text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE llm_cache (
 cache_key text PRIMARY KEY,
 response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
