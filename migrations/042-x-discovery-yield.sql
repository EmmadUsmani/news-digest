-- NULL preserves unknown historical discovery baselines.
ALTER TABLE x_search_citations ADD COLUMN new_candidate boolean;
