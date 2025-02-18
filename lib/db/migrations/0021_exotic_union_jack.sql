ALTER TABLE "criteria_examples" RENAME TO "files_to_criterias";--> statement-breakpoint
ALTER TABLE "files_to_criterias" DROP CONSTRAINT "criteria_examples_file_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "files_to_criterias" DROP CONSTRAINT "criteria_examples_criteria_id_criterias_id_fk";
--> statement-breakpoint
ALTER TABLE "files_to_criterias" DROP CONSTRAINT "criteria_examples_file_id_criteria_id_pk";--> statement-breakpoint
ALTER TABLE "files_to_criterias" ADD CONSTRAINT "files_to_criterias_file_id_criteria_id_pk" PRIMARY KEY("file_id","criteria_id");--> statement-breakpoint
ALTER TABLE "files_to_criterias" ADD CONSTRAINT "files_to_criterias_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files_to_criterias" ADD CONSTRAINT "files_to_criterias_criteria_id_criterias_id_fk" FOREIGN KEY ("criteria_id") REFERENCES "public"."criterias"("id") ON DELETE no action ON UPDATE no action;