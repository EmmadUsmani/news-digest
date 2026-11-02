-- Preserve all calls and charges; each topic now gets one durable daily attempt.
DROP INDEX x_discovery_one_scheduled_attempt_per_day;
CREATE UNIQUE INDEX x_discovery_one_scheduled_attempt_per_topic_day
  ON x_discovery_calls(scheduled_day, (requested_topic->>'id'))
  WHERE scheduled_day IS NOT NULL;
