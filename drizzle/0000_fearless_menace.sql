CREATE TABLE IF NOT EXISTS "ai_chat_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_summary_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" varchar(50) NOT NULL,
	"ai_summary" text NOT NULL,
	"ai_guidance" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "case_summary_cache_case_id_unique" UNIQUE("case_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_risk_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"risk_score" integer NOT NULL,
	"case_score" integer,
	"survey_score" integer,
	"training_score" integer,
	"engagement_score" integer,
	"snapshot_date" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_risk_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"risk_score" integer DEFAULT 50 NOT NULL,
	"case_score" integer DEFAULT 0,
	"survey_score" integer DEFAULT 0,
	"training_score" integer DEFAULT 0,
	"engagement_score" integer DEFAULT 0,
	"reasons" jsonb DEFAULT '[]'::jsonb,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "survey_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_id" varchar(50) NOT NULL,
	"response_count" integer DEFAULT 0,
	"sentiment_positive" real DEFAULT 0,
	"sentiment_negative" real DEFAULT 0,
	"sentiment_neutral" real DEFAULT 0,
	"risk_score" integer DEFAULT 0,
	"themes" jsonb DEFAULT '[]'::jsonb,
	"ai_insight" text,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "survey_analysis_survey_id_unique" UNIQUE("survey_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_session" ON "ai_chat_history" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_chat_created" ON "ai_chat_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerts_supplier" ON "alerts" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerts_unread" ON "alerts" USING btree ("is_read");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_case_cache_id" ON "case_summary_cache" USING btree ("case_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_history_supplier_date" ON "supplier_risk_history" USING btree ("supplier_id","snapshot_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_history_date" ON "supplier_risk_history" USING btree ("snapshot_date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_risk_supplier_id" ON "supplier_risk_scores" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_survey_analysis_survey" ON "survey_analysis" USING btree ("survey_id");