ALTER TABLE "labels" DROP CONSTRAINT "labels_example_image_id_files_id_fk";
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" DROP COLUMN "example_image_id";