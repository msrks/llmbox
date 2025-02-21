ALTER TABLE "prompt_evaluations" RENAME COLUMN "prompt_id" TO "prompt_template_id";--> statement-breakpoint
ALTER TABLE "prompt_evaluations" RENAME COLUMN "spec_id" TO "inspection_spec_id";--> statement-breakpoint
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_prompt_id_prompt_templates_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_spec_id_inspection_specs_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_prompt_template_id_prompt_templates_id_fk" FOREIGN KEY ("prompt_template_id") REFERENCES "public"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_inspection_spec_id_inspection_specs_id_fk" FOREIGN KEY ("inspection_spec_id") REFERENCES "public"."inspection_specs"("id") ON DELETE no action ON UPDATE no action;