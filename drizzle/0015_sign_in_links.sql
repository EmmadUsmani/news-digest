CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issuer_user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"recipient_email" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "admin_audit_log_action_check" CHECK (action = 'sign_in_link_issued'),
	CONSTRAINT "admin_audit_log_email_check" CHECK (recipient_email = lower(btrim(recipient_email)) AND length(recipient_email) BETWEEN 3 AND 254)
);
--> statement-breakpoint
CREATE TABLE "sign_in_links" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "sign_in_links_hash_check" CHECK (token_hash ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "sign_in_links_email_check" CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
	CONSTRAINT "sign_in_links_expiry_check" CHECK (expires_at > created_at AND expires_at <= created_at + interval '24 hours')
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_issuer_user_id_users_id_fk" FOREIGN KEY ("issuer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
REVOKE ALL ON TABLE sign_in_links, admin_audit_log FROM PUBLIC;
--> statement-breakpoint
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE sign_in_links, admin_audit_log FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
