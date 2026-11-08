CREATE TABLE "bookmarks" (
	"user_id" uuid NOT NULL,
	"item_key" text NOT NULL,
	"copy" jsonb,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "bookmarks_user_id_item_key_pk" PRIMARY KEY("user_id","item_key"),
	CONSTRAINT "bookmarks_key_check" CHECK (length(item_key) BETWEEN 1 AND 2048),
	CONSTRAINT "bookmarks_copy_check" CHECK (copy IS NULL OR (jsonb_typeof(copy) = 'object' AND octet_length(copy::text) <= 16384))
);
--> statement-breakpoint
CREATE TABLE "user_hidden_topics" (
	"user_id" uuid NOT NULL,
	"topic_id" text NOT NULL,
	"hidden" boolean NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "user_hidden_topics_user_id_topic_id_pk" PRIMARY KEY("user_id","topic_id"),
	CONSTRAINT "user_hidden_topics_key_check" CHECK (length(topic_id) BETWEEN 1 AND 200)
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hidden_topics" ADD CONSTRAINT "user_hidden_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
REVOKE ALL ON TABLE user_hidden_topics, bookmarks FROM PUBLIC;
--> statement-breakpoint
DO $$ DECLARE reader_role text; BEGIN
  FOREACH reader_role IN ARRAY ARRAY['grafana_product', 'postgres_metrics'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = reader_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE user_hidden_topics, bookmarks FROM %I', reader_role);
    END IF;
  END LOOP;
END $$;
