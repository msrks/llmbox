# LLMBox

Zero cloud LLM dependency, 100% local!

![hero](./public/hero.png)

## Tech Stack

- local App: [Next.js](https://nextjs.org/)
- local AI: [Ollama](https://ollama.com/)
- local DB: [Postgres](https://www.postgresql.org/)
- local Storage: [Minio](https://min.io/)

## How to run

1. Clone the repository
2. Run `docker compose up -d`
3. Run `pnpm install`
4. Run `pnpm dev`

## Prerequisites

- [Docker](https://www.docker.com/)
- [Ollama](https://ollama.com/)

## Dashboard

- App: [http://localhost:3000/](http://localhost:3000/)
- Minio: [http://localhost:9001/](http://localhost:9001/)

## Development

- DB: [https://local.drizzle.studio/](https://local.drizzle.studio/)
  - Run `pnpm run db:studio` to open the studio

## Entity Relationship Diagram

```mermaid
erDiagram
    projects {
        int id PK
        string name
        string description
        timestamp createdAt
        timestamp updatedAt
    }
    files {
        int id PK
        int projectId FK
        string fileName
        string originalName
        string mimeType
        int size
        string uploadType
        enum aiLabel "pass|fail"
        int aiPromptId FK
        enum humanLabel "pass|fail"
        vector embedding
        timestamp createdAt
    }
    criterias {
        int id PK
        int projectId FK
        string name
        string description
        timestamp createdAt
    }
    criteriaExamples {
        int fileId PK,FK "part of composite PK"
        int criteriaId PK,FK "part of composite PK"
        boolean isFail
        string reason
        timestamp createdAt
    }
    llmPrompts {
        int id PK
        int projectId FK
        string promptTemplate
        timestamp createdAt
    }
    specs {
        int id PK
        int projectId FK
        string description
        timestamp createdAt
    }
    promptEvaluations {
        int id PK
        int projectId FK
        timestamp createdAt
        int promptId FK
        int specId FK
        string finalPrompt
        float score
        string state
        int duration
        string analysisText
        int numDataset
    }
    evalResults {
        int id PK
        int fileId FK
        int promptEvalId FK
        enum llmLabel "pass|fail"
        string llmReason
        enum result "correct|incorrect"
        timestamp createdAt
    }

    projects ||--o{ files : "files"
    projects ||--o{ criterias : "criterias"
    projects ||--o{ llmPrompts : "llmPrompts"
    projects ||--o{ specs : "specs"
    projects ||--o{ promptEvaluations : "promptEvaluations"

    files ||--o| llmPrompts : "aiPrompt"
    files ||--o{ criteriaExamples : "examples"
    criterias ||--o{ criteriaExamples : "examples"
    criteriaExamples ||--|| files : "file"
    criteriaExamples ||--|| criterias : "criteria"
    promptEvaluations ||--|| llmPrompts : "prompt"
    promptEvaluations ||--|| specs : "spec"
    promptEvaluations ||--o{ evalResults : "evalResults"
    evalResults ||--|| files : "file"
    evalResults ||--|| promptEvaluations : "promptEval"
```
