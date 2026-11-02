-- One immutable reservation identity per UTC budget day. Scheduled timestamps
-- come from the saved cron/timezone, never from a hard-coded hour.
CREATE TABLE scheduled_ai_budget_days (
 budget_day date PRIMARY KEY,
 scheduled_at timestamptz NOT NULL,
 run_id text NOT NULL UNIQUE,
 state text NOT NULL DEFAULT 'pending'
   CHECK (state IN ('pending','running','retrying','succeeded','failed')),
 attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0),
 outcome jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (budget_day = (scheduled_at AT TIME ZONE 'UTC')::date),
 CHECK ((state = 'succeeded') = (outcome IS NOT NULL))
);
