CREATE TABLE "llm_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_template" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "ai_prompt_id" integer;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "human_label_id" integer;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_ai_prompt_id_llm_prompts_id_fk" FOREIGN KEY ("ai_prompt_id") REFERENCES "public"."llm_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_human_label_id_labels_id_fk" FOREIGN KEY ("human_label_id") REFERENCES "public"."labels"("id") ON DELETE no action ON UPDATE no action;