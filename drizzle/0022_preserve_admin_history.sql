-- Keep historical actor identifiers independently of account lifetime.
ALTER TABLE admin_audit_log DROP CONSTRAINT admin_audit_log_issuer_user_id_users_id_fk;
ALTER TABLE admin_write_admissions DROP CONSTRAINT admin_write_admissions_user_id_users_id_fk;

-- Validate new actors while retaining historical IDs after identity removal.
-- The row lock serializes admission against concurrent account deletion.
CREATE FUNCTION validate_admin_history_actor() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE actor_id uuid;
BEGIN
  actor_id := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
  IF actor_id IS NOT NULL THEN
    PERFORM id FROM users WHERE id = actor_id FOR KEY SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Admin history actor does not exist' USING ERRCODE = '23503';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER admin_audit_log_actor_check
BEFORE INSERT OR UPDATE OF issuer_user_id ON admin_audit_log
FOR EACH ROW EXECUTE FUNCTION validate_admin_history_actor('issuer_user_id');
CREATE TRIGGER admin_write_admissions_actor_check
BEFORE INSERT OR UPDATE OF user_id ON admin_write_admissions
FOR EACH ROW EXECUTE FUNCTION validate_admin_history_actor('user_id');
