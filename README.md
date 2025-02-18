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
    projects ||--o{ files : "has"
    projects ||--o{ labels : "has"
    projects ||--o{ criterias : "has"
    projects ||--o{ llmPrompts : "has"
    projects ||--o{ specs : "has"
    projects ||--o{ promptEvaluations : "has"

    projects {
        int id PK
        string name
        string description
        timestamp createdAt
        timestamp updatedAt
    }

    files ||--o{ filesToCriterias : "has"
    files ||--o{ evalResults : "has"
    files ||--o{ promptEvaluations : "evaluated_by"
    files {
        int id PK
        int projectId FK
        string fileName
        string originalName
        string mimeType
        int size
        enum uploadType
        enum aiLabel
        int aiPromptId FK
        enum humanLabel
        vector embedding
        timestamp createdAt
    }

    criterias ||--o{ filesToCriterias : "has"
    criterias {
        int id PK
        int projectId FK
        string name
        string description
        timestamp createdAt
    }

    filesToCriterias {
        int fileId FK
        int criteriaId FK
        boolean isFail
        string reason
        timestamp createdAt
    }

    llmPrompts ||--o{ promptEvaluations : "used_in"
    llmPrompts {
        int id PK
        int projectId FK
        string promptTemplate
        timestamp createdAt
    }

    specs ||--o{ promptEvaluations : "used_in"
    specs {
        int id PK
        int projectId FK
        string description
        timestamp createdAt
    }

    promptEvaluations ||--o{ evalResults : "has"
    promptEvaluations {
        int id PK
        int projectId FK
        int promptId FK
        int specId FK
        string finalPrompt
        float score
        enum state
        int duration
        string analysisText
        int numDataset
        timestamp createdAt
    }

    evalResults {
        int id PK
        int fileId FK
        int promptEvalId FK
        enum llmLabel
        string llmReason
        enum result
        timestamp createdAt
    }

    labels {
        int id PK
        int projectId FK
        string name
        string description
        timestamp createdAt
    }
```
