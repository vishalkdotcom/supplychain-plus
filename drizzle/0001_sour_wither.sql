CREATE TABLE "case_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" varchar(50) NOT NULL,
	"message_id" varchar(50),
	"message_text" text NOT NULL,
	"embedding" vector(1024),
	"cluster_id" integer,
	"cluster_label" varchar(255),
	"company_id" varchar(50),
	"company_name" varchar(255),
	"country" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payslip_anomalies" (
	"id" serial PRIMARY KEY NOT NULL,
	"payslip_id" varchar(50) NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"country" varchar(100),
	"anomaly_type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"actual_wage" real,
	"expected_wage" real,
	"deviation_percent" real,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ai_explanation" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_risk_forecast" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"supplier_name" varchar(255),
	"current_score" integer NOT NULL,
	"predicted_score" integer NOT NULL,
	"trend" varchar(20) NOT NULL,
	"trend_magnitude" real DEFAULT 0,
	"ai_narrative" text,
	"data_points" integer DEFAULT 0,
	"forecast_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survey_response_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" varchar(50) NOT NULL,
	"survey_id" varchar(50),
	"response_text" text NOT NULL,
	"sentiment" varchar(20),
	"sentiment_score" real DEFAULT 0,
	"topics" jsonb DEFAULT '[]'::jsonb,
	"embedding" vector(1024),
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "survey_response_analysis_response_id_unique" UNIQUE("response_id")
);
--> statement-breakpoint
CREATE INDEX "idx_case_embed_case" ON "case_embeddings" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "idx_case_embed_cluster" ON "case_embeddings" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "idx_case_embed_company" ON "case_embeddings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_case_embed_vector" ON "case_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "idx_anomaly_supplier" ON "payslip_anomalies" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_anomaly_severity" ON "payslip_anomalies" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_anomaly_type" ON "payslip_anomalies" USING btree ("anomaly_type");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_forecast_supplier" ON "supplier_risk_forecast" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_survey_resp_survey" ON "survey_response_analysis" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "idx_survey_resp_sentiment" ON "survey_response_analysis" USING btree ("sentiment");--> statement-breakpoint
CREATE INDEX "idx_survey_resp_vector" ON "survey_response_analysis" USING hnsw ("embedding" vector_cosine_ops);