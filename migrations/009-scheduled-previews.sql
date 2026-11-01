-- A scheduled slot creates at most one immutable edition, including after retries.
ALTER TABLE digest_previews ADD COLUMN scheduled_key text UNIQUE;
