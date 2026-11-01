CREATE TABLE digest_previews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 profile_id uuid NOT NULL REFERENCES profiles(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 window_start timestamptz NOT NULL, window_end timestamptz NOT NULL,
 snapshot jsonb NOT NULL, CHECK (window_start < window_end)
);
CREATE INDEX digest_previews_latest ON digest_previews(profile_id,created_at DESC);
CREATE FUNCTION reject_digest_preview_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Digest previews are immutable'; END;
$$;
CREATE TRIGGER immutable_digest_preview BEFORE UPDATE OR DELETE ON digest_previews
FOR EACH ROW EXECUTE FUNCTION reject_digest_preview_mutation();
