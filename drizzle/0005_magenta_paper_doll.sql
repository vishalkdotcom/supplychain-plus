CREATE TABLE "framework_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"framework_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"evidence_types" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulatory_frameworks" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(50) NOT NULL,
	"jurisdiction" varchar(100) NOT NULL,
	"effective_date" date,
	"next_deadline" date,
	"description" text,
	"website_url" varchar(500),
	"risk_weight_profile" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "regulatory_frameworks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "requirement_evidence" (
	"id" serial PRIMARY KEY NOT NULL,
	"requirement_id" integer NOT NULL,
	"evidence_id" integer NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"linked_by" varchar(100) DEFAULT 'system' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_framework_compliance" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" varchar(50) NOT NULL,
	"framework_id" integer NOT NULL,
	"status" varchar(30) DEFAULT 'not_assessed' NOT NULL,
	"completed_requirements" integer DEFAULT 0,
	"total_requirements" integer DEFAULT 0,
	"last_assessed_at" timestamp with time zone,
	"assessed_by" varchar(100),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "framework_requirements" ADD CONSTRAINT "framework_requirements_framework_id_regulatory_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."regulatory_frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_evidence" ADD CONSTRAINT "requirement_evidence_requirement_id_framework_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."framework_requirements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requirement_evidence" ADD CONSTRAINT "requirement_evidence_evidence_id_remediation_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."remediation_evidence"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_framework_compliance" ADD CONSTRAINT "supplier_framework_compliance_framework_id_regulatory_frameworks_id_fk" FOREIGN KEY ("framework_id") REFERENCES "public"."regulatory_frameworks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fw_req_framework" ON "framework_requirements" USING btree ("framework_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_fw_req_code" ON "framework_requirements" USING btree ("framework_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_re_req_evidence" ON "requirement_evidence" USING btree ("requirement_id","evidence_id");--> statement-breakpoint
CREATE INDEX "idx_re_supplier" ON "requirement_evidence" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sfc_supplier_framework" ON "supplier_framework_compliance" USING btree ("supplier_id","framework_id");--> statement-breakpoint
CREATE INDEX "idx_sfc_framework" ON "supplier_framework_compliance" USING btree ("framework_id");--> statement-breakpoint
CREATE INDEX "idx_sfc_status" ON "supplier_framework_compliance" USING btree ("status");