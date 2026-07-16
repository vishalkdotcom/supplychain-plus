import { describe, test, expect, mock, beforeEach } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the database module before importing the module under test.
// We define the mock db object up front so tests can configure it per case.
// ---------------------------------------------------------------------------

type SelectChain = {
  from: () => SelectChain;
  where: () => SelectChain;
  limit: () => Promise<{ id: number }[]>;
};

type InsertChain = {
  values: (vals?: unknown) => Promise<void>;
};

const mockSelectResult: { id: number }[] = [];

const mockSelectChain: SelectChain = {
  from: () => mockSelectChain,
  where: () => mockSelectChain,
  limit: () => Promise.resolve(mockSelectResult),
};

const mockInsertChain: InsertChain = {
  values: () => Promise.resolve(),
};

const mockDb = {
  select: (_fields?: unknown) => mockSelectChain,
  insert: (_table: unknown) => mockInsertChain,
  transaction: async (fn: (tx: typeof mockDb) => Promise<void>) => fn(mockDb),
};

mock.module("@/lib/db/drizzle", () => ({
  db: mockDb,
}));

// Also mock the logger so it doesn't emit noise during tests
mock.module("@/lib/logger", () => ({
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

// ---------------------------------------------------------------------------
// Import AFTER mocks are registered
// ---------------------------------------------------------------------------

import {
  buildReferenceId,
  attachAutoEvidence,
} from "@/lib/remediation/auto-evidence";

// ---------------------------------------------------------------------------
// Helpers to control mock state between tests
// ---------------------------------------------------------------------------

function setExistingRows(rows: { id: number }[]) {
  // Mutate the array in place so the shared reference used in the chain picks
  // it up without needing to replace the chain object itself.
  mockSelectResult.splice(0, mockSelectResult.length, ...rows);
}

function makeInsertResolve() {
  mockInsertChain.values = () => Promise.resolve();
}

function makeInsertThrow(message: string) {
  mockInsertChain.values = () => Promise.reject(new Error(message));
}

// ---------------------------------------------------------------------------
// Tests: buildReferenceId
// ---------------------------------------------------------------------------

describe("buildReferenceId", () => {
  test("basic format: type_date_supplierId", () => {
    const result = buildReferenceId("risk_score_drop", "2026-03-20", "123");
    expect(result).toBe("risk_score_drop_2026-03-20_123");
  });

  test("is deterministic — same inputs always produce the same output", () => {
    const a = buildReferenceId("survey_improvement", "2026-03", "456");
    const b = buildReferenceId("survey_improvement", "2026-03", "456");
    expect(a).toBe(b);
  });

  test("different type produces different output", () => {
    const a = buildReferenceId("risk_score_drop", "2026-03-20", "123");
    const b = buildReferenceId("anomaly_resolved", "2026-03-20", "123");
    expect(a).not.toBe(b);
  });

  test("different date produces different output", () => {
    const a = buildReferenceId("risk_score_drop", "2026-03-20", "123");
    const b = buildReferenceId("risk_score_drop", "2026-03-21", "123");
    expect(a).not.toBe(b);
  });

  test("different supplierId produces different output", () => {
    const a = buildReferenceId("risk_score_drop", "2026-03-20", "123");
    const b = buildReferenceId("risk_score_drop", "2026-03-20", "456");
    expect(a).not.toBe(b);
  });

  test("appends extra args separated by underscores", () => {
    const result = buildReferenceId(
      "survey_improvement",
      "2026-03",
      "456",
      "survey_42",
    );
    expect(result).toBe("survey_improvement_2026-03_456_survey_42");
  });

  test("multiple extra args are all appended", () => {
    const result = buildReferenceId("case_resolved", "2026-01", "789", "case_1", "batch_A");
    expect(result).toBe("case_resolved_2026-01_789_case_1_batch_A");
  });

  test("extra args make the output different from no-extra-args version", () => {
    const without = buildReferenceId("risk_score_drop", "2026-03-20", "123");
    const with_extra = buildReferenceId("risk_score_drop", "2026-03-20", "123", "extra");
    expect(without).not.toBe(with_extra);
  });

  test("different extra args produce different outputs", () => {
    const a = buildReferenceId("risk_score_drop", "2026-03-20", "123", "a");
    const b = buildReferenceId("risk_score_drop", "2026-03-20", "123", "b");
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// Tests: attachAutoEvidence
// ---------------------------------------------------------------------------

describe("attachAutoEvidence", () => {
  beforeEach(() => {
    // Reset to default: no existing rows, insert succeeds
    setExistingRows([]);
    makeInsertResolve();
  });

  test("returns true when evidence is inserted successfully", async () => {
    const result = await attachAutoEvidence(
      1,
      "risk_score_drop",
      "Risk score improved",
      "Supplier risk score dropped below threshold",
      "risk_score_drop_2026-03-20_123",
    );
    expect(result).toBe(true);
  });

  test("returns false when evidence with same referenceId already exists (dedup)", async () => {
    setExistingRows([{ id: 42 }]);

    const result = await attachAutoEvidence(
      1,
      "risk_score_drop",
      "Risk score improved",
      "Supplier risk score dropped below threshold",
      "risk_score_drop_2026-03-20_123",
    );
    expect(result).toBe(false);
  });

  test("returns false on unique constraint violation (concurrent insert)", async () => {
    makeInsertThrow("violates unique constraint idx_evidence_dedup");

    const result = await attachAutoEvidence(
      1,
      "risk_score_drop",
      "Risk score improved",
      "Supplier risk score dropped below threshold",
      "risk_score_drop_2026-03-20_123",
    );
    expect(result).toBe(false);
  });

  test("returns false on generic unique violation keyword", async () => {
    makeInsertThrow("unique constraint violation");

    const result = await attachAutoEvidence(
      2,
      "survey_improvement",
      "Survey score up",
      "Supplier improved survey results",
      "survey_improvement_2026-03_456",
    );
    expect(result).toBe(false);
  });

  test("writes audit log entry after successful insert", async () => {
    const insertCalls: unknown[][] = [];

    // Override insert to record calls and resolve
    mockDb.insert = (table: unknown) => {
      return {
        values: (vals: unknown) => {
          insertCalls.push([table, vals]);
          return Promise.resolve();
        },
      };
    };

    await attachAutoEvidence(
      5,
      "case_resolved",
      "Case closed",
      "All cases resolved",
      "case_resolved_2026-03-20_789",
    );

    // First insert: evidence row; second insert: audit log row
    expect(insertCalls).toHaveLength(2);

    const [_auditTable, auditValues] = insertCalls[1] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(auditValues).toMatchObject({
      remediationId: 5,
      action: "evidence_auto_attached",
      field: "evidence",
      newValue: "Case closed",
      actorId: "system",
      actorType: "auto_evidence_job",
    });
  });

  test("does not write audit log when dedup prevents insert", async () => {
    setExistingRows([{ id: 99 }]);

    const insertCalls: unknown[] = [];
    mockDb.insert = (table: unknown) => {
      insertCalls.push(table);
      return {
        values: () => Promise.resolve(),
      };
    };

    const result = await attachAutoEvidence(
      3,
      "risk_score_drop",
      "Risk score improved",
      "Already recorded",
      "risk_score_drop_2026-03-20_123",
    );

    expect(result).toBe(false);
    // insert should never be called when dedup fires on SELECT
    expect(insertCalls).toHaveLength(0);
  });

  test("does not write audit log on unique constraint violation", async () => {
    const insertCalls: unknown[] = [];
    let callCount = 0;

    mockDb.insert = (table: unknown) => {
      callCount++;
      insertCalls.push(table);
      return {
        values: () => {
          if (callCount === 1) {
            // First insert (evidence) fails with constraint violation
            return Promise.reject(new Error("idx_evidence_dedup unique constraint"));
          }
          return Promise.resolve();
        },
      };
    };

    const result = await attachAutoEvidence(
      4,
      "risk_score_drop",
      "Risk score improved",
      "Concurrent duplicate",
      "risk_score_drop_2026-03-20_123",
    );

    expect(result).toBe(false);
    // Only the evidence insert was attempted — audit log insert was not reached
    expect(insertCalls).toHaveLength(1);
  });
});
