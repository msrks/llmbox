# LLMBox

Zero cloud LLM dependency, 100% local!

![hero](./public/hero.png)

## Tech Stack

- App: [Next.js](https://nextjs.org/)
- AI: [Ollama](https://ollama.com/)
- DB: [Postgres](https://www.postgresql.org/)
- Storage: [Minio](https://min.io/)

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
    files {
        int id PK
        string fileName
        string originalName
        string mimeType
        int size
        string uploadType
        int aiLabelId FK
        int aiPromptId FK
        int humanLabelId FK
        vector embedding
        timestamp createdAt
    }
    labels {
        int id PK
        string name
        string description
        timestamp createdAt
    }
    criterias {
        int id PK
        string name
        string description
        timestamp createdAt
    }
    criteriaExamples {
        int id PK
        int fileId FK
        int criteriaId FK
        boolean isPositive
        string reason
        timestamp createdAt
    }
    llmPrompts {
        int id PK
        string promptTemplate
        timestamp createdAt
    }
    specs {
        int id PK
        string description
        timestamp createdAt
    }
    promptEvaluations {
        int id PK
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
        int llmLabelId FK
        string llmReason
        string result
        timestamp createdAt
    }

    files ||--o| labels : "aiLabel"
    files ||--o| labels : "humanLabel"
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
    evalResults ||--|| labels : "llmLabel"
```
