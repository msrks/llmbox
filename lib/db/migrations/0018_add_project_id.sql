-- Add projectId column to all tables
ALTER TABLE files
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

ALTER TABLE labels
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

ALTER TABLE criterias
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

ALTER TABLE llm_prompts
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

ALTER TABLE specs
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

ALTER TABLE prompt_evaluations
ADD COLUMN project_id TEXT NOT NULL DEFAULT 'default';

-- Remove the default value after adding the column
ALTER TABLE files
ALTER COLUMN project_id
DROP DEFAULT;

ALTER TABLE labels
ALTER COLUMN project_id
DROP DEFAULT;

ALTER TABLE criterias
ALTER COLUMN project_id
DROP DEFAULT;

ALTER TABLE llm_prompts
ALTER COLUMN project_id
DROP DEFAULT;

ALTER TABLE specs
ALTER COLUMN project_id
DROP DEFAULT;

ALTER TABLE prompt_evaluations
ALTER COLUMN project_id
DROP DEFAULT;