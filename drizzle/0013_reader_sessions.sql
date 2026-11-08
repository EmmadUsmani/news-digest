CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"admin_eligible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cookie_renewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "sessions_token_hash_check" CHECK (token_hash ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "sessions_cookie_time_check" CHECK (cookie_renewed_at >= created_at)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_normalized_email_check" CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254)
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");
--> statement-breakpoint
-- Account rows must remain private even when operational roles already exist.
REVOKE ALL ON TABLE users, sessions FROM PUBLIC;
--> statement-breakpoint
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE users, sessions FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
