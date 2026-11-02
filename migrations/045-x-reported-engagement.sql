-- Per-search model reports are immutable and never official platform metrics.
-- Historical citations retain SQL NULL (unknown); no fabricated backfill.
ALTER TABLE x_search_citations ADD COLUMN reported_engagement jsonb;
