import { Pool } from "pg";

const wcGlobalPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: "wc_global",
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  ssl:
    process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export const wcGlobalQuery = async (text: string, params?: unknown[]) => {
  return wcGlobalPool.query(text, params);
};

export default wcGlobalPool;
