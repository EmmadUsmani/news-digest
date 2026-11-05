CREATE TABLE "edition_job_requests" (
	"job_id" text PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edition_job_requests" ADD CONSTRAINT "edition_job_requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;