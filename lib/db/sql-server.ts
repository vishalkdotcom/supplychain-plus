import mssql from "mssql";

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

let poolPromise: Promise<mssql.ConnectionPool> | null = null;

export const getPool = () => {
  if (poolPromise) return poolPromise;

  poolPromise = new mssql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log("Connected to SQL Server");
      return pool;
    })
    .catch((err) => {
      poolPromise = null;
      console.error("Database Connection Failed! Bad Config: ", err);
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
