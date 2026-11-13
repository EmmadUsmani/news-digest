-- The seeded multi-term query returned no posts. Use one domestic institution
-- within the existing one-query/two-page allowance; preserve owner edits.
UPDATE topics SET bluesky_query='Congress'
WHERE id='00000000-0000-4000-8000-000000000015'
  AND bluesky_query='US Congress courts elections';
