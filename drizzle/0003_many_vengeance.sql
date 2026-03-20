CREATE TABLE "demo_users" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(100) NOT NULL,
	"avatar_color" varchar(30) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_daily_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"provider" varchar(32) NOT NULL,
	"model_id" varchar(128) NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"requests_used" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remediation_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"remediation_id" integer NOT NULL,
	"action" varchar(50) NOT NULL,
	"field" varchar(100),
	"previous_value" text,
	"new_value" text,
	"actor_id" varchar(100) DEFAULT 'system' NOT NULL,
	"actor_type" varchar(30) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remediation_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"remediation_id" integer NOT NULL,
	"evidence_type" varchar(50) NOT NULL,
	"reference_id" varchar(100),
	"title" varchar(500) NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remediation_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"status" varchar(30) DEFAULT 'detected' NOT NULL,
	"source_type" varchar(50) NOT NULL,
	"source_id" integer,
	"root_cause" text,
	"action_plan" text,
	"assigned_to" varchar(255),
	"target_date" date,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_monitoring_signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"signal_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "survey_temporal_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_name" varchar(255) NOT NULL,
	"trend_direction" varchar(20),
	"mentions_by_month" jsonb DEFAULT '{}'::jsonb,
	"affected_suppliers" jsonb DEFAULT '[]'::jsonb,
	"first_seen" date,
	"last_seen" date,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_clusters" ADD COLUMN "supplier_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "remediation_audit_log" ADD CONSTRAINT "remediation_audit_log_remediation_id_remediation_plans_id_fk" FOREIGN KEY ("remediation_id") REFERENCES "public"."remediation_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remediation_evidence" ADD CONSTRAINT "remediation_evidence_remediation_id_remediation_plans_id_fk" FOREIGN KEY ("remediation_id") REFERENCES "public"."remediation_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_rate_limit_date_provider_model" ON "rate_limit_daily_usage" USING btree ("date","provider","model_id");--> statement-breakpoint
CREATE INDEX "idx_audit_remediation" ON "remediation_audit_log" USING btree ("remediation_id");--> statement-breakpoint
CREATE INDEX "idx_evidence_remediation" ON "remediation_evidence" USING btree ("remediation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_evidence_dedup" ON "remediation_evidence" USING btree ("remediation_id","reference_id");--> statement-breakpoint
CREATE INDEX "idx_remediation_supplier" ON "remediation_plans" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_remediation_status" ON "remediation_plans" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_monitoring_supplier_type" ON "supplier_monitoring_signals" USING btree ("supplier_id","signal_type");--> statement-breakpoint
CREATE INDEX "idx_monitoring_type" ON "supplier_monitoring_signals" USING btree ("signal_type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_temporal_theme" ON "survey_temporal_patterns" USING btree ("theme_name");