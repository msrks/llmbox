import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  vector,
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
    aiPromptId: integer("ai_prompt_id").references(() => promptTemplates.id),
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
  aiPrompt: one(promptTemplates, {
    fields: [files.aiPromptId],
    references: [promptTemplates.id],
  }),
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  filesToCriterias: many(filesToCriterias),
  evalResults: many(evalResults),
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

export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promptTemplatesRelations = relations(
  promptTemplates,
  ({ one }) => ({
    project: one(projects, {
      fields: [promptTemplates.projectId],
      references: [projects.id],
    }),
  })
);

export const inspectionSpecs = pgTable("inspection_specs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inspectionSpecsRelations = relations(
  inspectionSpecs,
  ({ one }) => ({
    project: one(projects, {
      fields: [inspectionSpecs.projectId],
      references: [projects.id],
    }),
  })
);

export const promptEvaluations = pgTable("prompt_evaluations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  promptId: integer("prompt_id")
    .references(() => promptTemplates.id)
    .notNull(),
  specId: integer("spec_id")
    .references(() => inspectionSpecs.id)
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
    promptTemplate: one(promptTemplates, {
      fields: [promptEvaluations.promptId],
      references: [promptTemplates.id],
    }),
    inspectionSpec: one(inspectionSpecs, {
      fields: [promptEvaluations.specId],
      references: [inspectionSpecs.id],
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
  criterias: many(criterias),
  promptTemplates: many(promptTemplates),
  inspectionSpecs: many(inspectionSpecs),
  promptEvaluations: many(promptEvaluations),
}));

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Criteria = typeof criterias.$inferSelect;
export type NewCriteria = typeof criterias.$inferInsert;
export type FileToCriteria = typeof filesToCriterias.$inferSelect;
export type NewFileToCriteria = typeof filesToCriterias.$inferInsert;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type NewPromptTemplate = typeof promptTemplates.$inferInsert;
export type InspectionSpec = typeof inspectionSpecs.$inferSelect;
export type NewInspectionSpec = typeof inspectionSpecs.$inferInsert;
export type PromptEvaluation = typeof promptEvaluations.$inferSelect;
export type NewPromptEvaluation = typeof promptEvaluations.$inferInsert;
export type EvalResultRow = typeof evalResults.$inferSelect;
export type NewEvalResultRow = typeof evalResults.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
