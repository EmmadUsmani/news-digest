CREATE TABLE "edition_job_failures" (
	"job_id" text PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"duration_ms" integer NOT NULL,
	"failed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "edition_job_failures_duration_check" CHECK ("edition_job_failures"."duration_ms" >= 0)
);
--> statement-breakpoint
ALTER TABLE "edition_job_failures" ADD CONSTRAINT "edition_job_failures_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;