ALTER TABLE "job_queue" ADD COLUMN "retry_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "job_queue" ADD COLUMN "max_retries" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "job_queue" ADD COLUMN "timeout_ms" integer;--> statement-breakpoint
ALTER TABLE "job_queue" ADD COLUMN "retry_after" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "job_runs" ADD COLUMN "attempt" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_embedding_hnsw" ON "case_embeddings" USING hnsw ("embedding" vector_cosine_ops);