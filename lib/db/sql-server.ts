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
