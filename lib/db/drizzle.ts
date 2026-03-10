import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Build connection string from existing env vars, targeting the separate wovo_ai database
const connectionString = `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || ""}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DATABASE_WOVO_AI}`;

// postgres.js client — connection pooling is built-in
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

declare global {
  var drizzle: { db: PostgresJsDatabase<typeof schema>; client: postgres.Sql<Record<string, never>> } | undefined;
}

let dbInstance: PostgresJsDatabase<typeof schema>;
let clientInstance: postgres.Sql<Record<string, never>>;

if (global.drizzle) {
  dbInstance = global.drizzle.db;
  clientInstance = global.drizzle.client;
} else {
  clientInstance = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  dbInstance = drizzle(clientInstance, { schema });

  if (process.env.NODE_ENV !== "production") {
    global.drizzle = { db: dbInstance, client: clientInstance };
  }
}

export const db = dbInstance;
export { clientInstance as client };
