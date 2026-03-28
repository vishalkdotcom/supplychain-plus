# Remediation & Evidence — Closing the Detect→Act→Evidence Loop

## The Problem

You've detected a problem: a cluster of overtime complaints, a wage violation, a silence signal. Now what? You need to:
1. Track the fix from discovery through resolution
2. Collect evidence that the fix worked
3. Present this evidence trail to regulators

## The State Machine

Remediation plans follow a **forward-only** progression:

```
detected → root_cause → action_plan → implementing → verifying → closed
```

### Why Forward-Only?

Going from "implementing" back to "detected" would corrupt the audit trail. Regulators need to see clear progression:

1. You found it (detected)
2. You analyzed why (root cause)
3. You planned a fix (action plan)
4. You executed the fix (implementing)
5. You verified the fix worked (verifying)
6. You closed it (closed)

Backwards movement suggests confusion, cover-up, or an uncontrolled process. The code enforces this — `getNextStatus("implementing")` returns `"verifying"`, never `"root_cause"`.

### Source Types

Remediations can be created from:
- **Cluster:** A systemic case pattern was detected
- **Anomaly:** A payslip violation was found
- **Monitoring signal:** Silence, engagement decay, or regional contagion
- **Manual:** A human created it based on their own investigation

The `sourceType` and `sourceId` link back to the trigger, creating traceability from detection to action.

## The Audit Log

Every change to a remediation is logged in `remediationAuditLog`:

```typescript
{
  remediationId: 42,
  action: "status_change",       // or "field_edit", "evidence_added", "evidence_auto_attached"
  field: "status",
  previousValue: "action_plan",
  newValue: "implementing",
  actorId: "user-7",
  actorType: "user",             // or "system", "auto_evidence_job"
  createdAt: "2026-03-20T14:30:00Z"
}
```

Three actor types:
- **user:** A human made this change through the UI
- **system:** The system made this change (e.g., overdue detection)
- **auto_evidence_job:** A background job automatically attached evidence

This creates a complete, auditable history. A regulator can see exactly when each step happened, who did it, and what changed.

## Auto-Evidence: The System Notices When Fixes Work

This is the most valuable part of the remediation system. Instead of requiring humans to manually collect proof that problems were fixed, **multiple background jobs automatically detect improvements and link evidence to active plans.**

### How It Works

Each job checks: "Did something improve for a supplier that has an active remediation?"

| Job | What It Detects | Evidence Type |
|-----|----------------|---------------|
| `calculate-risk` | Risk score dropped >5 points | `risk_score_drop` |
| `calculate-risk` | Engagement improved >10% | `engagement_improvement` |
| `analyze-surveys` | Positive themes rising | `survey_improvement` |
| `case-clustering` | Cluster case count dropped <3 | (cluster shrinking) |
| `remediation-evidence-sweep` | Cases resolved in last 30 days | `case_resolved` |
| `remediation-evidence-sweep` | Training courses completed | `training_completed` |
| `remediation-evidence-sweep` | Case volume down >30% | `case_volume_decrease` |
| `payslip-anomaly` | All anomalies resolved for supplier | `anomaly_resolved` |

### The Evidence Sweep Job

`remediation-evidence-sweep` runs last in the pipeline and does three explicit cross-database checks per active remediation:

**1. SQL Server — Resolved Cases:**
```sql
SELECT COUNT(*) FROM [Case]
WHERE CompanyId = @companyId
AND CaseStatusId >= 5   -- resolved
AND Modified >= DATEADD(day, -30, GETDATE())
```
If count > 0: "X cases were resolved in the last 30 days."

**2. MySQL — Training Completions:**
```sql
SELECT COUNT(DISTINCT cc.course) FROM mdl_company_course mcc
JOIN mdl_course_completions cc ON cc.course = mcc.courseid
WHERE mcc.companyid = ? AND cc.timecompleted IS NOT NULL
```
If count > 0: "Workers completed X training courses."

**3. PostgreSQL — Case Volume Decline:**
```sql
-- Compare last 30 days vs previous 30 days
COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent,
COUNT(*) FILTER (WHERE created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days') as previous
```
If recent < previous * 0.7: "Case volume dropped 30%+ month-over-month."

### Race-Safe Deduplication

Multiple jobs might detect the same improvement for the same supplier. The dedup system prevents double-counting:

**Step 1: Deterministic reference IDs.** Each piece of evidence gets a predictable, repeatable key:

```typescript
buildReferenceId("risk_score_drop", "2026-03-20", "supplier-123")
// → "risk_score_drop_2026-03-20_supplier-123"
```

Same inputs always produce the same key. Run the job twice on the same day → same key → detected as duplicate.

**Step 2: Database unique index.** `remediationEvidence` has a unique index on `(remediationId, referenceId)`. Duplicate inserts fail at the database level.

**Step 3: Catch the constraint violation.**

```typescript
try {
  await db.transaction(async (tx) => {
    await tx.insert(remediationEvidence).values(evidence);
    await tx.insert(remediationAuditLog).values(auditEntry);
  });
  return true; // Attached successfully
} catch (err) {
  if (isUniqueViolation(err)) {
    return false; // Already exists — not an error
  }
  throw err; // Actual error — propagate
}
```

The unique constraint violation is treated as **success** (evidence is already there). This means two jobs running concurrently can both try to attach the same evidence — one succeeds, the other gracefully acknowledges it's already done. No locks, no coordination, no race condition.

### The Fast-Path Dedup

Before even attempting an insert, the system does a SELECT check:

```typescript
const existing = await db.select()
  .from(remediationEvidence)
  .where(and(
    eq(remediationEvidence.remediationId, id),
    eq(remediationEvidence.referenceId, refId)
  ));
if (existing.length > 0) return false; // Skip without trying
```

This avoids the overhead of beginning a transaction just to hit a constraint. The database unique index is the safety net; the SELECT is the fast path.

## Evidence Export

When a compliance officer needs to present evidence to a regulator, `/api/remediations/{id}/export` generates a JSON package:

```json
{
  "summary": "Remediation plan for Overtime Violations at Factory XYZ...",
  "plan": { "title": "...", "status": "verifying", "rootCause": "...", ... },
  "evidence": [
    { "type": "case_resolved", "title": "15 cases resolved", "date": "..." },
    { "type": "training_completed", "title": "Safety training complete", "date": "..." },
    { "type": "risk_score_drop", "title": "Risk dropped from 78 to 52", "date": "..." }
  ],
  "auditTrail": [
    { "action": "status_change", "from": "detected", "to": "root_cause", "actor": "..." },
    ...
  ]
}
```

Human-readable summary + structured data + full audit trail. This is what a regulator audits.
