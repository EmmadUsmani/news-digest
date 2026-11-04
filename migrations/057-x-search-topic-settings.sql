-- Configuration only: the existing production search does not consume this yet.
CREATE TABLE x_search_topic_settings (
  topic_id uuid PRIMARY KEY REFERENCES topics(id) ON DELETE CASCADE,
  reaction_min_faves integer NOT NULL CHECK (reaction_min_faves >= 0),
  trending_min_faves integer NOT NULL CHECK (trending_min_faves >= 0),
  exclusions text[] NOT NULL
);
-- Seed only original topics that still exist; never recreate deleted topics.
INSERT INTO x_search_topic_settings (topic_id, reaction_min_faves, trending_min_faves, exclusions)
SELECT topics.id, seed.reactions, seed.trending, seed.exclusions
FROM (VALUES
  ('00000000-0000-4000-8000-000000000011'::uuid, 50, 500, ARRAY[]::text[]),
  ('00000000-0000-4000-8000-000000000012'::uuid, 100, 1000, ARRAY['-odds','-parlay','-picks','-bet']),
  ('00000000-0000-4000-8000-000000000013'::uuid, 50, 500, ARRAY[]::text[]),
  ('00000000-0000-4000-8000-000000000014'::uuid, 200, 2000, ARRAY[]::text[])
) AS seed(topic_id, reactions, trending, exclusions)
JOIN topics ON topics.id = seed.topic_id;
