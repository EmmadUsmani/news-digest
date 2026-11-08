ALTER TABLE "digest_previews" ALTER COLUMN "profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "edition_job_failures" ALTER COLUMN "profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "edition_job_requests" ALTER COLUMN "profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "topics" ALTER COLUMN "profile_id" DROP NOT NULL;