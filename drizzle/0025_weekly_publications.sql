CREATE TABLE "weekly_publications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_key" text NOT NULL,
	"profile_id" uuid,
	"window_start" timestamp with time zone NOT NULL,
	"window_end" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"snapshot" jsonb NOT NULL,
	CONSTRAINT "weekly_publications_generation_key_key" UNIQUE("generation_key"),
	CONSTRAINT "weekly_publications_generation_key_check" CHECK (length(generation_key) > 0),
	CONSTRAINT "weekly_publications_check" CHECK (window_start < window_end)
);
--> statement-breakpoint
ALTER TABLE "weekly_publications" ADD CONSTRAINT "weekly_publications_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "weekly_publications_history" ON "weekly_publications" USING btree ("profile_id","published_at" DESC NULLS LAST);
--> statement-breakpoint
CREATE TRIGGER immutable_weekly_publication BEFORE UPDATE OR DELETE ON weekly_publications
FOR EACH ROW EXECUTE FUNCTION reject_digest_preview_mutation();
