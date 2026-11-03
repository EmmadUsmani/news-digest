-- Optional searches remain opt-in; existing scheduled writers keep the first slot.
ALTER TABLE x_discovery_calls
  ADD COLUMN verification_completed_at timestamptz,
  ADD COLUMN optional_parent_id uuid REFERENCES x_discovery_calls(id);
DROP INDEX x_discovery_one_scheduled_attempt_per_topic_day;
CREATE UNIQUE INDEX x_discovery_one_scheduled_attempt_per_topic_day
  ON x_discovery_calls(scheduled_day, (requested_topic->>'id'))
  WHERE scheduled_day IS NOT NULL AND optional_parent_id IS NULL;
CREATE UNIQUE INDEX x_discovery_one_optional_attempt_per_topic_day
  ON x_discovery_calls(scheduled_day, (requested_topic->>'id'))
  WHERE scheduled_day IS NOT NULL AND optional_parent_id IS NOT NULL;
ALTER TABLE x_discovery_calls ADD CONSTRAINT x_optional_requires_schedule
  CHECK (optional_parent_id IS NULL OR
    (scheduled_day IS NOT NULL AND requested_topic->>'id' IS NOT NULL));
