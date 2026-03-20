import { db } from "@/lib/db/drizzle";
import {
  remediationPlans,
  remediationEvidence,
  remediationAuditLog,
} from "@/lib/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

/**
 * Find all active (non-closed) remediation plans for a given supplier.
 */
export async function findActiveRemediationsForSupplier(supplierId: string) {
  return db
    .select()
    .from(remediationPlans)
    .where(
      and(
        eq(remediationPlans.supplierId, supplierId),
        ne(remediationPlans.status, "closed"),
      ),
    );
}

/**
 * Find all active remediation plans (any supplier).
 */
export async function findAllActiveRemediations() {
  return db
    .select()
    .from(remediationPlans)
    .where(ne(remediationPlans.status, "closed"));
}

/**
 * Build a deterministic reference ID for deduplication.
 * Same inputs always produce the same referenceId, preventing duplicate evidence.
 *
 * @example buildReferenceId("risk_score_drop", "2026-03-20", "123") => "risk_score_drop_2026-03-20_123"
 * @example buildReferenceId("survey_improvement", "2026-03", "456", "survey_42") => "survey_improvement_2026-03_456_survey_42"
 */
export function buildReferenceId(
  type: string,
  date: string,
  supplierId: string,
  ...extra: string[]
): string {
  return [type, date, supplierId, ...extra].join("_");
}

/**
 * Attach auto-detected evidence to a remediation plan with deduplication.
 *
 * - Checks if evidence with the same referenceId already exists
 * - If not, inserts the evidence and writes an audit log entry
 * - Returns true if evidence was attached, false if already existed
 */
export async function attachAutoEvidence(
  remediationId: number,
  evidenceType: string,
  title: string,
  description: string,
  referenceId: string,
): Promise<boolean> {
  try {
    // Fast-path dedup: skip if evidence with this referenceId already exists
    const existing = await db
      .select({ id: remediationEvidence.id })
      .from(remediationEvidence)
      .where(
        and(
          eq(remediationEvidence.remediationId, remediationId),
          eq(remediationEvidence.referenceId, referenceId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return false;
    }

    const today = new Date().toISOString().slice(0, 10);

    // Insert evidence + audit log atomically
    // Unique index (remediationId, referenceId) prevents duplicates
    // if a concurrent job passed the SELECT check above
    await db.transaction(async (tx) => {
      await tx.insert(remediationEvidence).values({
        remediationId,
        evidenceType,
        referenceId,
        title,
        description,
        date: today,
      });

      await tx.insert(remediationAuditLog).values({
        remediationId,
        action: "evidence_auto_attached",
        field: "evidence",
        previousValue: null,
        newValue: title,
        actorId: "system",
        actorType: "auto_evidence_job",
      });
    });

    logger.info(
      "auto-evidence",
      `Attached ${evidenceType} evidence to remediation #${remediationId}: ${title}`,
    );
    return true;
  } catch (error) {
    // Unique constraint violation means concurrent insert won the race — not an error
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("idx_evidence_dedup") || msg.includes("unique")) {
      return false;
    }
    logger.warn(
      "auto-evidence",
      `Failed to attach evidence to remediation #${remediationId}`,
      error,
    );
    return false;
  }
}
