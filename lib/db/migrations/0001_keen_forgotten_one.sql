ALTER TABLE "files" DROP CONSTRAINT "files_file_name_unique";--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "file_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "original_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "mime_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "files" DROP COLUMN "bucket";