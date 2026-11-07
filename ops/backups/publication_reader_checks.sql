-- Scratch-only reader contract. No application query or production schema changes.
BEGIN;
DO $$
DECLARE
  expected uuid[];
  actual uuid[];
  page uuid[];
  candidate digest_previews%ROWTYPE;
  manual_id uuid;
  test_id uuid;
  position integer;
BEGIN
  -- Derive the independent oracle from the owner's original backfill policy.
  SELECT array_agg(id ORDER BY created_at DESC, id DESC) INTO expected
    FROM digest_previews
    WHERE scheduled_key IS NOT NULL AND scheduled_key NOT LIKE 'integration:%'
      AND created_at >= '2026-11-03T00:00:00Z'::timestamptz;
  IF coalesce(cardinality(expected), 0) = 0 THEN
    RAISE EXCEPTION 'Reader rehearsal needs published candidates';
  END IF;
  -- Newer private editions must not displace latest or consume history slots.
  SELECT * INTO STRICT candidate FROM digest_previews WHERE id = expected[1];
  candidate.created_at := candidate.created_at + interval '1 day';
  candidate.scheduled_key := NULL;
  candidate.published_at := NULL;
  candidate.kind := 'manual';
  candidate.id := gen_random_uuid();
  manual_id := candidate.id;
  INSERT INTO digest_previews SELECT candidate.*;
  candidate.kind := 'test';
  candidate.id := gen_random_uuid();
  test_id := candidate.id;
  INSERT INTO digest_previews SELECT candidate.*;

  SELECT array_agg(id ORDER BY created_at DESC, id DESC) INTO actual
    FROM digest_previews WHERE published_at IS NOT NULL;
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'Published history differs from owner policy';
  END IF;
  IF (SELECT id FROM digest_previews WHERE published_at IS NOT NULL
      ORDER BY created_at DESC, id DESC LIMIT 1) IS DISTINCT FROM expected[1] THEN
    RAISE EXCEPTION 'Private edition displaced latest';
  END IF;
  FOR position IN 0..cardinality(expected) LOOP
    SELECT array_agg(id ORDER BY created_at DESC, id DESC) INTO page FROM (
      SELECT id, created_at FROM digest_previews WHERE published_at IS NOT NULL
        ORDER BY created_at DESC, id DESC LIMIT 2 OFFSET position
    ) entries;
    IF coalesce(page, ARRAY[]::uuid[]) IS DISTINCT FROM expected[position + 1:position + 2] THEN
      RAISE EXCEPTION 'Private edition affected history pagination';
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM digest_previews WHERE published_at IS NOT NULL
      AND NOT (id = ANY(expected))) OR
     EXISTS (SELECT 1 FROM digest_previews WHERE published_at IS NOT NULL
      AND id IN (manual_id, test_id)) THEN
    RAISE EXCEPTION 'Private direct link exposed';
  END IF;
  IF (SELECT count(*) FROM digest_previews WHERE published_at IS NOT NULL
      AND id = ANY(expected)) <> cardinality(expected) THEN
    RAISE EXCEPTION 'Published direct link missing';
  END IF;
  -- Admin reads retain both unpublished kinds without a visibility predicate.
  IF (SELECT count(*) FROM digest_previews WHERE id IN (manual_id, test_id)) <> 2 THEN
    RAISE EXCEPTION 'Private editions missing from admin reads';
  END IF;
END $$;
ROLLBACK;
