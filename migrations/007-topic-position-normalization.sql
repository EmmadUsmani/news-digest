-- Preserve each profile's reading order while repairing one-based positions
-- written by the original reorder endpoint.
WITH ordered AS (
  SELECT id, (row_number() OVER (PARTITION BY profile_id ORDER BY position, id) - 1)::int AS position
  FROM topics
)
UPDATE topics SET position = ordered.position
FROM ordered WHERE topics.id = ordered.id;
