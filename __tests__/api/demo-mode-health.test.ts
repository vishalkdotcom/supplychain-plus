import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

const pgQueryMock = mock(() => Promise.resolve({ rows: [{ "?column?": 1 }] }));
const sqlQueryMock = mock(() => Promise.resolve({ recordset: [{ "": 1 }] }));
const mysqlQueryMock = mock(() => Promise.resolve([{ "": 1 }]));
const drizzleExecuteMock = mock(() => Promise.resolve([{ "?column?": 1 }]));

mock.module("@/lib/db/postgres", () => ({ query: pgQueryMock }));
mock.module("@/lib/db/sql-server", () => ({
  query: sqlQueryMock,
  paramQuery: mock(() => Promise.resolve({ recordset: [] })),
  getPool: mock(() =>
    Promise.resolve({
      request: () => ({
        input: () => ({
          query: () => Promise.resolve({ recordset: [] }),
        }),
      }),
    }),
  ),
}));
mock.module("@/lib/db/mysql", () => ({ query: mysqlQueryMock }));
mock.module("@/lib/db/drizzle", () => ({
  db: { execute: drizzleExecuteMock },
}));

import { GET } from "@/app/api/health/route";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  global.mssqlPoolPromise = undefined;
  process.env = { ...ORIGINAL_ENV };
  pgQueryMock.mockClear();
  sqlQueryMock.mockClear();
  mysqlQueryMock.mockClear();
  drizzleExecuteMock.mockClear();
  pgQueryMock.mockImplementation(() =>
    Promise.resolve({ rows: [{ "?column?": 1 }] }),
  );
  sqlQueryMock.mockImplementation(() =>
    Promise.resolve({ recordset: [{ "": 1 }] }),
  );
  mysqlQueryMock.mockImplementation(() => Promise.resolve([{ "": 1 }]));
  drizzleExecuteMock.mockImplementation(() =>
    Promise.resolve([{ "?column?": 1 }]),
  );
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("health route demo mode", () => {
  test("demo mode only checks derived DB and returns healthy", async () => {
    process.env.DEMO_MODE = "true";

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("healthy");
    expect(json.checks).toEqual({
      derivedDb: expect.objectContaining({ status: "healthy" }),
    });
    expect(drizzleExecuteMock).toHaveBeenCalledTimes(1);
    expect(pgQueryMock).not.toHaveBeenCalled();
    expect(sqlQueryMock).not.toHaveBeenCalled();
    expect(mysqlQueryMock).not.toHaveBeenCalled();
  });

  test("demo mode returns 503 when derived DB is unhealthy", async () => {
    process.env.DEMO_MODE = "true";
    drizzleExecuteMock.mockImplementation(() =>
      Promise.reject(new Error("connection refused")),
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.checks.derivedDb.status).toBe("unhealthy");
    expect(pgQueryMock).not.toHaveBeenCalled();
  });

  test("non-demo mode checks all source databases", async () => {
    delete process.env.DEMO_MODE;

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("healthy");
    expect(json.checks).toEqual({
      postgres: expect.objectContaining({ status: "healthy" }),
      sqlServer: expect.objectContaining({ status: "healthy" }),
      mysql: expect.objectContaining({ status: "healthy" }),
    });
    expect(pgQueryMock).toHaveBeenCalledTimes(1);
    expect(sqlQueryMock).toHaveBeenCalledTimes(1);
    expect(mysqlQueryMock).toHaveBeenCalledTimes(1);
    expect(drizzleExecuteMock).not.toHaveBeenCalled();
  });

  test("non-demo mode returns 503 when any source database is unhealthy", async () => {
    delete process.env.DEMO_MODE;
    sqlQueryMock.mockImplementation(() =>
      Promise.reject(new Error("sql server down")),
    );

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.checks.sqlServer.status).toBe("unhealthy");
    expect(pgQueryMock).toHaveBeenCalledTimes(1);
    expect(mysqlQueryMock).toHaveBeenCalledTimes(1);
  });
});
