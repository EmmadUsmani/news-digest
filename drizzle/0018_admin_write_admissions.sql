CREATE TABLE "admin_write_admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"local_script" boolean NOT NULL,
	"method" text NOT NULL,
	"target" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "admin_write_admissions_actor_check" CHECK ((user_id IS NOT NULL AND NOT local_script) OR (user_id IS NULL AND local_script)),
	CONSTRAINT "admin_write_admissions_method_check" CHECK (method IN ('POST', 'PUT', 'DELETE')),
	CONSTRAINT "admin_write_admissions_target_check" CHECK (length(target) BETWEEN 1 AND 512 AND target LIKE '/api/%' AND target !~ '[?%#[:space:]]')
);
--> statement-breakpoint
ALTER TABLE "admin_write_admissions" ADD CONSTRAINT "admin_write_admissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
REVOKE ALL ON TABLE admin_write_admissions FROM PUBLIC;
--> statement-breakpoint
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE admin_write_admissions FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
