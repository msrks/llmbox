ALTER TABLE "llm_prompts" RENAME TO "prompt_templates";--> statement-breakpoint
ALTER TABLE "prompt_templates" RENAME COLUMN "prompt_template" TO "text";--> statement-breakpoint
ALTER TABLE "files" DROP CONSTRAINT "files_ai_prompt_id_llm_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_prompt_id_llm_prompts_id_fk";
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_ai_prompt_id_prompt_templates_id_fk" FOREIGN KEY ("ai_prompt_id") REFERENCES "public"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_prompt_id_prompt_templates_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;