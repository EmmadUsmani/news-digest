BEGIN;
ALTER TABLE digest_previews ADD COLUMN kind text NOT NULL DEFAULT 'manual'
  CHECK (kind IN ('scheduled', 'manual', 'test'));
ALTER TABLE digest_previews ADD COLUMN published_at timestamptz;
ALTER TABLE digest_previews ADD CONSTRAINT digest_previews_test_unpublished
  CHECK (kind <> 'test' OR published_at IS NULL);
ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview;
UPDATE digest_previews SET
  kind = CASE WHEN scheduled_key LIKE 'integration:%' THEN 'test'
    WHEN scheduled_key IS NOT NULL AND created_at >= '2026-11-03T00:00:00Z'::timestamptz
      THEN 'scheduled' ELSE 'manual' END,
  published_at = CASE WHEN scheduled_key IS NOT NULL
    AND scheduled_key NOT LIKE 'integration:%'
    AND created_at >= '2026-11-03T00:00:00Z'::timestamptz THEN created_at ELSE NULL END;
ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview;
COMMIT;
