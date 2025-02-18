ALTER TABLE "eval_results" DROP CONSTRAINT "eval_results_llm_label_id_labels_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_label_id_labels_id_fk";
--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_human_label_id_labels_id_fk";
--> statement-breakpoint
ALTER TABLE "eval_results" ADD COLUMN "llm_label" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "ai_label" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "human_label" text;--> statement-breakpoint
ALTER TABLE "eval_results" DROP COLUMN "llm_label_id";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "label_id";--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "human_label_id";