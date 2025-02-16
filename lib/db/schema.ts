import {
  timestamp,
  integer,
  pgTable,
  serial,
  text,
  vector,
  index,
} from "drizzle-orm/pg-core";

export const files = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type"),
    size: integer("size").notNull(),
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

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
