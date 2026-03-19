CREATE TABLE "job_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_run_id" integer NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"requires_ollama" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"locked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'queued' NOT NULL,
	"triggered_by" varchar(20) DEFAULT 'manual' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration_ms" integer,
	"result_summary" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_type" varchar(50) NOT NULL,
	"cron_expression" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp with time zone,
	"next_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_job_run_id_job_runs_id_fk" FOREIGN KEY ("job_run_id") REFERENCES "public"."job_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_queue_status" ON "job_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_queue_run" ON "job_queue" USING btree ("job_run_id");--> statement-breakpoint
CREATE INDEX "idx_job_runs_type" ON "job_runs" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_job_runs_status" ON "job_runs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_runs_created" ON "job_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_job_schedules_type" ON "job_schedules" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "idx_job_schedules_next" ON "job_schedules" USING btree ("next_run_at");