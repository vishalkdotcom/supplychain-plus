import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import postgres from "postgres";

const connectionString = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`;
const sql_pg = postgres(connectionString, { connect_timeout: 5 });

async function main() {
  try {
    const cols = await sql_pg`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'survey_mdlsurveyuserresponses' OR table_name = 'survey_mdlsurveyquestionresponses'
    `;
    console.log("Columns:", cols);

    const questions = await sql_pg`
      SELECT * FROM survey_mdlsurveyquestionresponses LIMIT 5
    `;
    console.log("\nSample Question Responses:");
    console.log(questions);

  } catch(e) {
    console.log("Postgres error", e);
  }
  process.exit(0);
}

main();
