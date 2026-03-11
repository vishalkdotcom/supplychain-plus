import { db } from "../lib/db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping case_embeddings and survey_response_analysis...");
  await db.execute(sql`DROP TABLE IF EXISTS case_embeddings;`);
  await db.execute(sql`DROP TABLE IF EXISTS survey_response_analysis;`);
  console.log("Dropped tables.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Error dropping tables:", e);
  process.exit(1);
});
