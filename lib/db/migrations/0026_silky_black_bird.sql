ALTER TABLE "eval_results" RENAME TO "eval_details";--> statement-breakpoint
ALTER TABLE "eval_details" DROP CONSTRAINT "eval_results_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "eval_details" DROP CONSTRAINT "eval_results_prompt_eval_id_prompt_evaluations_id_fk";
--> statement-breakpoint
ALTER TABLE "eval_details" ADD CONSTRAINT "eval_details_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eval_details" ADD CONSTRAINT "eval_details_prompt_eval_id_prompt_evaluations_id_fk" FOREIGN KEY ("prompt_eval_id") REFERENCES "public"."prompt_evaluations"("id") ON DELETE no action ON UPDATE no action;