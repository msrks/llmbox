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
  primaryKey,
} from "drizzle-orm/pg-core";

export const UploadType = {
  MANUAL: "manual",
  API: "api",
} as const;

export const EvalResult = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
} as const;

export const Label = {
  PASS: "pass",
  FAIL: "fail",
} as const;

export const PromptEvalState = {
  RUNNING: "running",
  FAILED: "failed",
  FINISHED: "finished",
} as const;

export type UploadType = (typeof UploadType)[keyof typeof UploadType];
export type EvalResult = (typeof EvalResult)[keyof typeof EvalResult];
export type Label = (typeof Label)[keyof typeof Label];
export type PromptEvalState =
  (typeof PromptEvalState)[keyof typeof PromptEvalState];

export const files = pgTable(
  "files",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    fileName: text("file_name").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type"),
    size: integer("size").notNull(),
    uploadType: text("upload_type", { enum: ["manual", "api"] })
      .notNull()
      .default("manual"),
    aiLabel: text("ai_label", { enum: ["pass", "fail"] }),
    aiPromptId: integer("ai_prompt_id").references(() => llmPrompts.id),
    humanLabel: text("human_label", { enum: ["pass", "fail"] }),
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

export const filesRelations = relations(files, ({ one, many }) => ({
  aiPrompt: one(llmPrompts, {
    fields: [files.aiPromptId],
    references: [llmPrompts.id],
  }),
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  filesToCriterias: many(filesToCriterias),
  evalResults: many(evalResults),
  labels: many(labels),
  criterias: many(criterias),
  llmPrompts: many(llmPrompts),
  specs: many(specs),
  promptEvaluations: many(promptEvaluations),
}));

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labelsRelations = relations(labels, ({ one }) => ({
  project: one(projects, {
    fields: [labels.projectId],
    references: [projects.id],
  }),
}));

export const criterias = pgTable("criterias", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const criteriasRelations = relations(criterias, ({ many, one }) => ({
  filesToCriterias: many(filesToCriterias),
  project: one(projects, {
    fields: [criterias.projectId],
    references: [projects.id],
  }),
}));

export const filesToCriterias = pgTable(
  "files_to_criterias",
  {
    fileId: integer("file_id")
      .references(() => files.id)
      .notNull(),
    criteriaId: integer("criteria_id")
      .references(() => criterias.id)
      .notNull(),
    isFail: boolean("is_fail").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.fileId, table.criteriaId] }),
  })
);

export const filesToCriteriasRelations = relations(
  filesToCriterias,
  ({ one }) => ({
    file: one(files, {
      fields: [filesToCriterias.fileId],
      references: [files.id],
    }),
    criteria: one(criterias, {
      fields: [filesToCriterias.criteriaId],
      references: [criterias.id],
    }),
  })
);

export const llmPrompts = pgTable("llm_prompts", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const llmPromptsRelations = relations(llmPrompts, ({ one }) => ({
  project: one(projects, {
    fields: [llmPrompts.projectId],
    references: [projects.id],
  }),
}));

export const specs = pgTable("specs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const specsRelations = relations(specs, ({ one }) => ({
  project: one(projects, {
    fields: [specs.projectId],
    references: [projects.id],
  }),
}));

export const promptEvaluations = pgTable("prompt_evaluations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
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
    project: one(projects, {
      fields: [promptEvaluations.projectId],
      references: [projects.id],
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
  llmLabel: text("llm_label", { enum: ["pass", "fail"] }).notNull(),
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
}));

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  files: many(files),
  labels: many(labels),
  criterias: many(criterias),
  llmPrompts: many(llmPrompts),
  specs: many(specs),
  promptEvaluations: many(promptEvaluations),
}));

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Criteria = typeof criterias.$inferSelect;
export type NewCriteria = typeof criterias.$inferInsert;
export type FileToCriteria = typeof filesToCriterias.$inferSelect;
export type NewFileToCriteria = typeof filesToCriterias.$inferInsert;
export type LlmPrompt = typeof llmPrompts.$inferSelect;
export type NewLlmPrompt = typeof llmPrompts.$inferInsert;
export type Spec = typeof specs.$inferSelect;
export type NewSpec = typeof specs.$inferInsert;
export type PromptEvaluation = typeof promptEvaluations.$inferSelect;
export type NewPromptEvaluation = typeof promptEvaluations.$inferInsert;
export type EvalResultRow = typeof evalResults.$inferSelect;
export type NewEvalResultRow = typeof evalResults.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
