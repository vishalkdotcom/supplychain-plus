import mssql from "mssql";
import { logger } from "@/lib/logger";

const config: mssql.config = {
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  database: process.env.SQLSERVER_DATABASE,
  server: process.env.SQLSERVER_SERVER || "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // for local dev
  },
};

declare global {
  var mssqlPoolPromise: Promise<mssql.ConnectionPool> | undefined;
}

const poolPromiseValue =
  global.mssqlPoolPromise ||
  new mssql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      logger.info("db/sql-server", "Connected to SQL Server");
      return pool;
    })
    .catch((err) => {
      logger.error("db/sql-server", "Database connection failed", err);
      throw err;
    });

if (process.env.NODE_ENV !== "production") {
  global.mssqlPoolPromise = poolPromiseValue;
}

let poolPromise: Promise<mssql.ConnectionPool> | null = poolPromiseValue;

export const getPool = () => {
  if (poolPromise) return poolPromise;

  poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      logger.info("db/sql-server", "Connected to SQL Server");
      return pool;
    })
    .catch((err) => {
      poolPromise = null;
      logger.error("db/sql-server", "Database connection failed", err);
      throw err;
    });

  return poolPromise;
};

export const query = async (sql: string) => {
  const pool = await getPool();
  return pool.request().query(sql);
};

/**
 * Execute a parameterized SQL Server query.
 * params is a record of { name: { type, value } } passed to request.input().
 * Use @name placeholders in the SQL string.
 */
export const paramQuery = async (
  sql: string,
  params: Record<
    string,
    { type: (() => mssql.ISqlType) | mssql.ISqlType; value: unknown }
  >,
) => {
  const pool = await getPool();
  const request = pool.request();
  for (const [name, { type, value }] of Object.entries(params)) {
    request.input(name, type, value);
  }
  return request.query(sql);
};
