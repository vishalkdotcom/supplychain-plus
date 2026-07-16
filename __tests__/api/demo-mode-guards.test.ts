import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the database module before importing modules under test.
// ---------------------------------------------------------------------------

let nextInsertRows: unknown[] = [];
let nextUpdateRows: unknown[] = [];
let nextSelectRows: unknown[] = [];

const insertCalls: Array<{ table: unknown; values: unknown }> = [];
const updateCalls: Array<{ table: unknown; set: unknown }> = [];

const selectChain = {
  from: (_t: unknown) => selectChain,
  where: (_c?: unknown) => selectChain,
  orderBy: (..._args: unknown[]) => selectChain,
  limit: (_n: number) => selectChain,
  offset: (_n: number) => selectChain,
  then(resolve: (v: unknown[]) => void, reject: (e: unknown) => void) {
    try {
      resolve(nextSelectRows);
    } catch (e) {
      reject(e);
    }
  },
};

const mockDb = {
  select: () => selectChain,
  insert: (table: unknown) => ({
    values: (vals: unknown) => {
      insertCalls.push({ table, values: vals });
      return {
        returning: () => Promise.resolve(nextInsertRows),
      };
    },
  }),
  update: (table: unknown) => ({
    set: (updates: unknown) => {
      updateCalls.push({ table, set: updates });
      return {
        where: (_cond: unknown) => ({
          returning: () => Promise.resolve(nextUpdateRows),
        }),
      };
    },
  }),
  transaction: async (fn: (tx: typeof mockDb) => Promise<unknown>) => fn(mockDb),
};

mock.module("@/lib/db/drizzle", () => ({ db: mockDb }));

mock.module("@/lib/logger", () => ({
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

mock.module("@/lib/cache/invalidate", () => ({
  invalidateAfterRemediationUpdate: () => {},
  invalidateAfterAlertUpdate: () => {},
}));

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

// ---------------------------------------------------------------------------
// Import route handlers AFTER mocks are registered.
// ---------------------------------------------------------------------------

import {
  rejectIfDemoAiOutsideChat,
  rejectIfDemoApiNotAllowed,
  rejectIfDemoJobExecution,
  rejectIfDemoMutation,
} from "@/lib/demo-mode/guards";
import { POST as remediationsPost } from "@/app/api/remediations/route";
import { PATCH as remediationsPatch } from "@/app/api/remediations/[id]/route";
import { POST as draftResponsePost } from "@/app/api/ai/draft-response/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = { ...process.env };

function makeRequest(
  method: string,
  url: string,
  body?: unknown,
): Request {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new Request(url, {
    ...init,
    headers: { "content-type": "application/json" },
  });
}

function makeRouteParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePlan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    supplierId: "SUP001",
    title: "Fix wage gap",
    status: "detected",
    sourceType: "cluster",
    sourceId: null,
    rootCause: null,
    actionPlan: null,
    assignedTo: null,
    targetDate: null,
    closedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  global.mssqlPoolPromise = undefined;
  process.env = { ...ORIGINAL_ENV };
  nextInsertRows = [];
  nextUpdateRows = [];
  nextSelectRows = [];
  insertCalls.splice(0);
  updateCalls.splice(0);
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

// ===========================================================================
// Demo mode guard helpers
// ===========================================================================

describe("demo mode guard helpers", () => {
  test("rejectIfDemoMutation returns 403 when demo mode is on", async () => {
    process.env.DEMO_MODE = "true";

    const blocked = rejectIfDemoMutation();
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(403);
    const json = await blocked!.json();
    expect(json.error).toBe("Demo Mode is read-only");
  });

  test("rejectIfDemoMutation returns null when demo mode is off", () => {
    delete process.env.DEMO_MODE;
    expect(rejectIfDemoMutation()).toBeNull();
  });

  test("rejectIfDemoJobExecution returns 403 when demo mode is on", async () => {
    process.env.DEMO_MODE = "true";

    const blocked = rejectIfDemoJobExecution();
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(403);
    const json = await blocked!.json();
    expect(json.error).toBe("Jobs cannot run in Demo Mode");
  });

  test("rejectIfDemoJobExecution returns null when demo mode is off", () => {
    delete process.env.DEMO_MODE;
    expect(rejectIfDemoJobExecution()).toBeNull();
  });

  test("rejectIfDemoApiNotAllowed returns 403 for source-backed APIs in demo mode", async () => {
    process.env.DEMO_MODE = "true";

    const blocked = rejectIfDemoApiNotAllowed("/api/cases");
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(403);
    const json = await blocked!.json();
    expect(json.error).toBe("Not available in Demo Mode");
  });

  test("rejectIfDemoApiNotAllowed returns null for allowed APIs in demo mode", () => {
    process.env.DEMO_MODE = "true";
    expect(rejectIfDemoApiNotAllowed("/api/clusters")).toBeNull();
  });

  test("rejectIfDemoApiNotAllowed returns null when demo mode is off", () => {
    delete process.env.DEMO_MODE;
    expect(rejectIfDemoApiNotAllowed("/api/cases")).toBeNull();
  });

  test("rejectIfDemoAiOutsideChat returns 403 for non-chat AI routes in demo mode", async () => {
    process.env.DEMO_MODE = "true";

    const blocked = rejectIfDemoAiOutsideChat("/api/ai/draft-response");
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(403);
    const json = await blocked!.json();
    expect(json.error).toBe("AI feature not available in Demo Mode");
  });

  test("rejectIfDemoAiOutsideChat allows main chat route in demo mode", () => {
    process.env.DEMO_MODE = "true";
    expect(rejectIfDemoAiOutsideChat("/api/ai/chat")).toBeNull();
  });
});

// ===========================================================================
// Demo mode mutation guards (route wiring)
// ===========================================================================

describe("demo mode mutation guards", () => {
  test("POST /api/remediations returns 403 in demo mode", async () => {
    process.env.DEMO_MODE = "true";

    const req = makeRequest("POST", "http://localhost/api/remediations", {
      supplierId: "SUP001",
      title: "Blocked plan",
      sourceType: "manual",
    });
    const res = await remediationsPost(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Demo Mode is read-only");
    expect(insertCalls).toHaveLength(0);
  });

  test("POST /api/remediations still works when demo mode is off", async () => {
    delete process.env.DEMO_MODE;
    nextInsertRows = [makePlan({ id: 99 })];

    const req = makeRequest("POST", "http://localhost/api/remediations", {
      supplierId: "SUP001",
      title: "Allowed plan",
      sourceType: "manual",
    });
    const res = await remediationsPost(req);

    expect(res.status).toBe(201);
    expect(insertCalls.length).toBeGreaterThan(0);
  });

  test("PATCH /api/remediations/[id] returns 403 in demo mode", async () => {
    process.env.DEMO_MODE = "true";

    const req = makeRequest(
      "PATCH",
      "http://localhost/api/remediations/1",
      { status: "root_cause" },
    );
    const res = await remediationsPatch(req, makeRouteParams("1"));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Demo Mode is read-only");
    expect(updateCalls).toHaveLength(0);
  });

  test("POST /api/ai/draft-response returns 403 in demo mode", async () => {
    process.env.DEMO_MODE = "true";

    const req = makeRequest("POST", "http://localhost/api/ai/draft-response", {
      caseText: "Worker complaint about wages",
    });
    const res = await draftResponsePost(req);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("AI feature not available in Demo Mode");
  });
});
