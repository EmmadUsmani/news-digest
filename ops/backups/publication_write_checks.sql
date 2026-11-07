-- Synthetic future saves on a scratch restore only. Always rolled back.
BEGIN;
SET LOCAL TIME ZONE 'Pacific/Honolulu';
DO $$
DECLARE
  probe jsonb;
  candidate digest_previews%ROWTYPE;
  stored digest_previews%ROWTYPE;
  expected_kind text;
  expected_published timestamptz;
BEGIN
  FOR probe IN SELECT value FROM jsonb_array_elements(PROBE_JSON) LOOP
    -- Independent oracle: future scheduled intent ignores the backfill cutoff.
    expected_kind := CASE
      WHEN probe->>'intent' = 'test' OR probe->>'key' LIKE 'integration:%' THEN 'test'
      ELSE probe->>'intent' END;
    expected_published := CASE WHEN expected_kind = 'scheduled'
      THEN (probe->>'savedAt')::timestamptz ELSE NULL END;
    SELECT * INTO STRICT candidate FROM digest_previews ORDER BY id LIMIT 1;
    candidate.id := gen_random_uuid();
    candidate.scheduled_key := probe->>'key';
    candidate.created_at := (probe->>'savedAt')::timestamptz;
    candidate.kind := probe->>'kind';
    candidate.published_at := (probe->>'publishedAt')::timestamptz;
    INSERT INTO digest_previews SELECT candidate.*;
    SELECT * INTO STRICT stored FROM digest_previews WHERE id = candidate.id;
    IF stored.kind IS DISTINCT FROM expected_kind
      OR stored.published_at IS DISTINCT FROM expected_published
      OR stored.created_at IS DISTINCT FROM candidate.created_at
      OR stored.snapshot IS DISTINCT FROM candidate.snapshot THEN
      RAISE EXCEPTION 'Future publication persistence differs from policy';
    END IF;
    IF candidate.scheduled_key IS NOT NULL THEN
      -- A duplicate scheduled key must never create a second edition.
      candidate.id := gen_random_uuid();
      BEGIN
        INSERT INTO digest_previews SELECT candidate.*;
        RAISE EXCEPTION 'Duplicate scheduled key accepted';
      EXCEPTION WHEN unique_violation THEN NULL;
      END;
    END IF;
  END LOOP;
END $$;
ROLLBACK;
