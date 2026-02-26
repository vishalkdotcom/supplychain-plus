import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Build connection string from existing env vars, targeting the separate wovo_ai database
const connectionString =
  process.env.DRIZZLE_DATABASE_URL ||
  `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || ""}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/wovo_ai`;

// postgres.js client — connection pooling is built-in
const client = postgres(connectionString, {
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Connection timeout
});

export const db = drizzle(client, { schema });

// Export client for raw queries if needed
export { client };
