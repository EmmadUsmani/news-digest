CREATE TABLE "development_spend_pools" (
	"provider" text PRIMARY KEY NOT NULL,
	"cap_micros" integer NOT NULL,
	CONSTRAINT "development_spend_pools_provider_check" CHECK ("development_spend_pools"."provider" IN ('anthropic', 'xai')),
	CONSTRAINT "development_spend_pools_cap_micros_check" CHECK ("development_spend_pools"."cap_micros" >= 0 AND "development_spend_pools"."cap_micros" <= CASE "development_spend_pools"."provider" WHEN 'anthropic' THEN 5000000 ELSE 2000000 END)
);
--> statement-breakpoint
CREATE TABLE "development_spend_reservations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"reserved_micros" integer NOT NULL,
	"cost_micros" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "development_spend_reservations_reserved_micros_check" CHECK ("development_spend_reservations"."reserved_micros" > 0),
	CONSTRAINT "development_spend_reservations_cost_micros_check" CHECK ("development_spend_reservations"."cost_micros" >= 0)
);
--> statement-breakpoint
ALTER TABLE "development_spend_reservations" ADD CONSTRAINT "development_spend_provider_fk" FOREIGN KEY ("provider") REFERENCES "public"."development_spend_pools"("provider") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "development_spend_provider" ON "development_spend_reservations" USING btree ("provider");
--> statement-breakpoint
INSERT INTO development_spend_pools (provider, cap_micros) VALUES ('anthropic', 5000000), ('xai', 2000000);
