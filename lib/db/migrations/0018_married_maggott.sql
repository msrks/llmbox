CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "criterias" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "labels" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "llm_prompts" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD COLUMN "project_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "specs" ADD COLUMN "project_id" text NOT NULL;