CREATE TABLE "labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"definition" text,
	"example_image_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "label_id" integer;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_example_image_id_files_id_fk" FOREIGN KEY ("example_image_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;