import { relations } from "drizzle-orm";
import {
  timestamp,
  integer,
  pgTable,
  serial,
  text,
  vector,
  index,
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const UploadType = {
  MANUAL: "manual",
  API: "api",
} as const;

export const EvalResult = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
} as const;

export const PromptEvalState = {
  RUNNING: "running",
  FAILED: "failed",
  FINISHED: "finished",
} as const;

export type UploadType = (typeof UploadType)[keyof typeof UploadType];
export type EvalResult = (typeof EvalResult)[keyof typeof EvalResult];
export type PromptEvalState =
  (typeof PromptEvalState)[keyof typeof PromptEvalState];

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
    aiLabelId: integer("label_id").references(() => labels.id),
    aiPromptId: integer("ai_prompt_id").references(() => llmPrompts.id),
    humanLabelId: integer("human_label_id").references(() => labels.id),
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
  aiLabel: one(labels, { fields: [files.aiLabelId], references: [labels.id] }),
  humanLabel: one(labels, {
    fields: [files.humanLabelId],
    references: [labels.id],
  }),
  aiPrompt: one(llmPrompts, {
    fields: [files.aiPromptId],
    references: [llmPrompts.id],
  }),
}));

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const criterias = pgTable("criterias", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const criteriaExamples = pgTable("criteria_examples", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id")
    .references(() => files.id)
    .notNull(),
  criteriaId: integer("criteria_id")
    .references(() => criterias.id)
    .notNull(),
  isPositive: boolean("is_positive").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const criteriaExamplesRelations = relations(
  criteriaExamples,
  ({ one }) => ({
    file: one(files, {
      fields: [criteriaExamples.fileId],
      references: [files.id],
    }),
    criteria: one(criterias, {
      fields: [criteriaExamples.criteriaId],
      references: [criterias.id],
    }),
  })
);

export const criteriasRelations = relations(criterias, ({ many }) => ({
  examples: many(criteriaExamples),
}));

export const llmPrompts = pgTable("llm_prompts", {
  id: serial("id").primaryKey(),
  promptTemplate: text("prompt_template").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specs = pgTable("specs", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promptEvaluations = pgTable("prompt_evaluations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  promptId: integer("prompt_id")
    .references(() => llmPrompts.id)
    .notNull(),
  specId: integer("spec_id")
    .references(() => specs.id)
    .notNull(),
  finalPrompt: text("final_prompt").notNull(),
  score: real("score"),
  state: text("state", { enum: ["running", "failed", "finished"] })
    .notNull()
    .default("running"),
  duration: integer("duration"),
  analysisText: text("analysis_text"),
  numDataset: integer("num_dataset"),
});

export const promptEvaluationsRelations = relations(
  promptEvaluations,
  ({ one, many }) => ({
    prompt: one(llmPrompts, {
      fields: [promptEvaluations.promptId],
      references: [llmPrompts.id],
    }),
    spec: one(specs, {
      fields: [promptEvaluations.specId],
      references: [specs.id],
    }),
    evalResults: many(evalResults),
  })
);

export const evalResults = pgTable("eval_results", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id")
    .references(() => files.id)
    .notNull(),
  promptEvalId: integer("prompt_eval_id")
    .references(() => promptEvaluations.id)
    .notNull(),
  llmLabelId: integer("llm_label_id")
    .references(() => labels.id)
    .notNull(),
  llmReason: text("llm_reason").notNull(),
  result: text("result", { enum: ["correct", "incorrect"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const evalResultsRelations = relations(evalResults, ({ one }) => ({
  file: one(files, {
    fields: [evalResults.fileId],
    references: [files.id],
  }),
  promptEval: one(promptEvaluations, {
    fields: [evalResults.promptEvalId],
    references: [promptEvaluations.id],
  }),
  llmLabel: one(labels, {
    fields: [evalResults.llmLabelId],
    references: [labels.id],
  }),
}));

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export type Criteria = typeof criterias.$inferSelect;
export type NewCriteria = typeof criterias.$inferInsert;
export type CriteriaExample = typeof criteriaExamples.$inferSelect;
export type NewCriteriaExample = typeof criteriaExamples.$inferInsert;
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type LlmPrompt = typeof llmPrompts.$inferSelect;
export type NewLlmPrompt = typeof llmPrompts.$inferInsert;
export type Spec = typeof specs.$inferSelect;
export type NewSpec = typeof specs.$inferInsert;
export type PromptEvaluation = typeof promptEvaluations.$inferSelect;
export type NewPromptEvaluation = typeof promptEvaluations.$inferInsert;
export type EvalResultRow = typeof evalResults.$inferSelect;
export type NewEvalResultRow = typeof evalResults.$inferInsert;
