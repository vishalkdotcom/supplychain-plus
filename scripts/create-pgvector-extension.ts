import { db } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Creating vector extension if not exists...");
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
  console.log("Extension created.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error creating extension:", e);
  process.exit(1);
});
