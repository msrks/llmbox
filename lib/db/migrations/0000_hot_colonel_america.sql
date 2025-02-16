CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"bucket" varchar(64) NOT NULL,
	"file_name" varchar(128) NOT NULL,
	"original_name" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"size" integer NOT NULL,
	CONSTRAINT "files_file_name_unique" UNIQUE("file_name")
);
