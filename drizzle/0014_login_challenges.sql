CREATE TABLE "login_codes" (
	"email" text PRIMARY KEY NOT NULL,
	"code_hash" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "login_codes_email_check" CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
	CONSTRAINT "login_codes_hash_check" CHECK (code_hash ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "login_codes_attempts_check" CHECK (attempts BETWEEN 0 AND 5),
	CONSTRAINT "login_codes_expiry_check" CHECK (expires_at > created_at)
);

--> statement-breakpoint
-- Account rows must remain private even when operational roles already exist.
REVOKE ALL ON TABLE login_codes FROM PUBLIC;
--> statement-breakpoint
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE login_codes FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
