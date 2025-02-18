CREATE TABLE
    criteria_examples (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL REFERENCES files (id),
        criteria_id INTEGER NOT NULL REFERENCES criterias (id),
        is_positive BOOLEAN NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW ()
    );