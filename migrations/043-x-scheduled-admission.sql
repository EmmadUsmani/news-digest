-- Preserve historical/manual calls; scheduled attempts consume one UTC day even
-- when the provider rejects them. Budget admission and this claim share a lock.
ALTER TABLE x_discovery_calls ADD COLUMN scheduled_day date;
CREATE UNIQUE INDEX x_discovery_one_scheduled_attempt_per_day
  ON x_discovery_calls(scheduled_day) WHERE scheduled_day IS NOT NULL;
