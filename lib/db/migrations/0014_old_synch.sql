CREATE TABLE "criteria_examples" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" integer NOT NULL,
	"criteria_id" integer NOT NULL,
	"is_positive" boolean NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "criterias" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "criteria_examples" ADD CONSTRAINT "criteria_examples_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criteria_examples" ADD CONSTRAINT "criteria_examples_criteria_id_criterias_id_fk" FOREIGN KEY ("criteria_id") REFERENCES "public"."criterias"("id") ON DELETE no action ON UPDATE no action;