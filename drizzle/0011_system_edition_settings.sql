CREATE TABLE "edition_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"cadence" text NOT NULL,
	"timezone" text NOT NULL,
	"coverage_window" text NOT NULL,
	"story_budget" integer NOT NULL,
	"post_budget" integer NOT NULL,
	CONSTRAINT "edition_settings_singleton_check" CHECK (id = 1),
	CONSTRAINT "edition_settings_story_budget_check" CHECK (story_budget BETWEEN 0 AND 20),
	CONSTRAINT "edition_settings_post_budget_check" CHECK (post_budget BETWEEN 0 AND 20)
);
--> statement-breakpoint
-- Preserve the actual configured schedule; never reset it to seed defaults.
INSERT INTO edition_settings (id, cadence, timezone, coverage_window, story_budget, post_budget)
SELECT 1, cadence, timezone, coverage_window, story_budget, post_budget
FROM digest_schedules
WHERE profile_id = '00000000-0000-4000-8000-000000000001';
--> statement-breakpoint
-- Fail the whole migration if the authoritative schedule is missing.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM edition_settings WHERE id = 1) THEN
    RAISE EXCEPTION 'Default profile schedule missing; cannot initialize system settings';
  END IF;
END $$;
