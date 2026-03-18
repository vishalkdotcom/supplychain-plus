CREATE TABLE "case_clusters" (
	"id" serial PRIMARY KEY NOT NULL,
	"cluster_label" text,
	"case_count" integer,
	"supplier_count" integer,
	"regions" jsonb DEFAULT '[]'::jsonb,
	"case_types" jsonb DEFAULT '[]'::jsonb,
	"representative_messages" jsonb DEFAULT '[]'::jsonb,
	"ai_summary" text,
	"severity" varchar(20),
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" varchar(50) NOT NULL,
	"message_id" varchar(50) NOT NULL,
	"embedding" vector(1024),
	"cluster_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_playbook_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_type_id" varchar(50) NOT NULL,
	"case_type_name" varchar(255),
	"region" varchar(100),
	"avg_resolution_days" real,
	"best_resolution_days" real,
	"total_resolved" integer,
	"best_practices" jsonb,
	"ai_summary" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" varchar(50) NOT NULL,
	"language" varchar(10) NOT NULL,
	"translated_content" jsonb,
	"translated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intelligence_briefing" (
	"id" serial PRIMARY KEY NOT NULL,
	"attention_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payslip_anomalies" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"anomaly_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"details" jsonb,
	"ai_interpretation" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_risk_forecast" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"forecast_date" date NOT NULL,
	"predicted_risk_score" integer NOT NULL,
	"predicted_case_score" integer,
	"predicted_survey_score" integer,
	"predicted_training_score" integer,
	"confidence" real,
	"trend_direction" varchar(20),
	"ai_reasoning" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_voice_trends" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50),
	"month" date NOT NULL,
	"emerging_topics" jsonb DEFAULT '[]'::jsonb,
	"declining_topics" jsonb DEFAULT '[]'::jsonb,
	"sentiment_shift" real,
	"top_themes" jsonb DEFAULT '[]'::jsonb,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_chat_history" ADD COLUMN "session_title" text;--> statement-breakpoint
ALTER TABLE "ai_chat_history" ADD COLUMN "is_pinned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "alerts" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "supplier_risk_scores" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "supplier_risk_scores" ADD COLUMN "region" varchar(100);--> statement-breakpoint
ALTER TABLE "supplier_risk_scores" ADD COLUMN "latitude" real;--> statement-breakpoint
ALTER TABLE "supplier_risk_scores" ADD COLUMN "longitude" real;--> statement-breakpoint
ALTER TABLE "supplier_risk_scores" ADD COLUMN "parent_company_id" varchar(50);--> statement-breakpoint
CREATE INDEX "idx_embedding_case" ON "case_embeddings" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "idx_embedding_cluster" ON "case_embeddings" USING btree ("cluster_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_playbook_type_region" ON "case_playbook_cache" USING btree ("case_type_id","region");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_translation_course_lang" ON "course_translations" USING btree ("course_id","language");--> statement-breakpoint
CREATE INDEX "idx_anomaly_supplier" ON "payslip_anomalies" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_anomaly_detected" ON "payslip_anomalies" USING btree ("detected_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_forecast_supplier_date" ON "supplier_risk_forecast" USING btree ("supplier_id","forecast_date");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_voice_supplier_month" ON "worker_voice_trends" USING btree ("supplier_id","month");