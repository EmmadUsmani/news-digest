-- Reassert account privacy for existing installations and every tool reader.
-- Product/catalog grants on other tables are deliberately retained.
REVOKE ALL ON TABLE users, sessions, login_codes, sign_in_links,
  admin_audit_log, user_hidden_topics, bookmarks, admin_write_admissions FROM PUBLIC;
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics', 'grafana_public_product', 'grafana_export_reader', 'schema_catalog_reader'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE users, sessions, login_codes, sign_in_links, admin_audit_log, user_hidden_topics, bookmarks, admin_write_admissions FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
