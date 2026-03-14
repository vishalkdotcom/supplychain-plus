\connect wovo_ai

-- pgvector is required for the embedding columns (vector 1024) in the Drizzle schema.
-- Tables themselves are created by: bun run db:push
CREATE EXTENSION IF NOT EXISTS vector;
