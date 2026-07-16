import { mock } from "bun:test";

const emptyRecordset = { recordset: [] as unknown[] };

mock.module("@/lib/db/sql-server", () => ({
  query: mock(() => Promise.resolve(emptyRecordset)),
  paramQuery: mock(() => Promise.resolve(emptyRecordset)),
  getPool: mock(() =>
    Promise.resolve({
      request: () => ({
        input: () => ({
          query: () => Promise.resolve(emptyRecordset),
        }),
      }),
    }),
  ),
}));
