CREATE TABLE "regional_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"region" varchar(100) NOT NULL,
	"supplier_count" integer DEFAULT 0,
	"avg_risk_score" real DEFAULT 0,
	"avg_case_score" real DEFAULT 0,
	"avg_survey_score" real DEFAULT 0,
	"avg_training_score" real DEFAULT 0,
	"avg_engagement_score" real DEFAULT 0,
	"high_risk_count" integer DEFAULT 0,
	"silent_count" integer DEFAULT 0,
	"issue_prevalence" jsonb DEFAULT '[]'::jsonb,
	"peer_comparisons" jsonb DEFAULT '[]'::jsonb,
	"contextual_silence_alerts" jsonb DEFAULT '[]'::jsonb,
	"cluster_overlap" jsonb DEFAULT '[]'::jsonb,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_benchmark_region" ON "regional_benchmarks" USING btree ("region");