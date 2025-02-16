ALTER TABLE "files" ALTER COLUMN "mime_type" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "mime_type" DROP NOT NULL;