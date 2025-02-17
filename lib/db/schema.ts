import { relations } from "drizzle-orm";
import {
  timestamp,
  integer,
  pgTable,
  serial,
  text,
  vector,
  index,
} from "drizzle-orm/pg-core";

export const UploadType = {
  MANUAL: "manual",
  API: "api",
} as const;

export type UploadType = (typeof UploadType)[keyof typeof UploadType];

export const files = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type"),
    size: integer("size").notNull(),
    uploadType: text("upload_type", { enum: ["manual", "api"] })
      .notNull()
      .default("manual"),
    labelId: integer("label_id").references(() => labels.id),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("files_embedding_idx").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const filesRelations = relations(files, ({ one }) => ({
  label: one(labels, { fields: [files.labelId], references: [labels.id] }),
}));

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  definition: text("definition"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
