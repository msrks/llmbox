ALTER TABLE "files" ALTER COLUMN "mime_type" SET DEFAULT 'application/octet-stream';--> statement-breakpoint
ALTER TABLE "files" ALTER COLUMN "mime_type" SET NOT NULL;