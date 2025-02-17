CREATE TABLE "eval_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" integer NOT NULL,
	"prompt_eval_id" integer NOT NULL,
	"llm_label_id" integer NOT NULL,
	"llm_reason" text NOT NULL,
	"result" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"prompt_id" integer NOT NULL,
	"spec_id" integer NOT NULL,
	"score" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_prompt_eval_id_prompt_evaluations_id_fk" FOREIGN KEY ("prompt_eval_id") REFERENCES "public"."prompt_evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_results" ADD CONSTRAINT "eval_results_llm_label_id_labels_id_fk" FOREIGN KEY ("llm_label_id") REFERENCES "public"."labels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_prompt_id_llm_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."llm_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_spec_id_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."specs"("id") ON DELETE no action ON UPDATE no action;