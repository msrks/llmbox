ALTER TABLE "specs" RENAME TO "inspection_specs";--> statement-breakpoint
ALTER TABLE "prompt_evaluations" DROP CONSTRAINT "prompt_evaluations_spec_id_specs_id_fk";
--> statement-breakpoint
ALTER TABLE "prompt_evaluations" ADD CONSTRAINT "prompt_evaluations_spec_id_inspection_specs_id_fk" FOREIGN KEY ("spec_id") REFERENCES "public"."inspection_specs"("id") ON DELETE no action ON UPDATE no action;